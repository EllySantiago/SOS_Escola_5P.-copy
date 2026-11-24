import importlib.util
import json
import os
import pathlib
import tempfile
import unittest
from unittest.mock import patch


ROOT = pathlib.Path(__file__).resolve().parents[4]
SCRIPT = ROOT / ".github" / "actions" / "gerar-relatorios" / "metricas_relatorios.py"
FIXTURES = pathlib.Path(__file__).parent / "fixtures"

spec = importlib.util.spec_from_file_location("metricas_relatorios", SCRIPT)
metricas = importlib.util.module_from_spec(spec)
spec.loader.exec_module(metricas)


class ColetarMetricasXmlTests(unittest.TestCase):
    def test_suíte_verde_preserva_contagem_e_tempo(self):
        resultado = metricas.coletar_metricas_xml(FIXTURES / "green")

        self.assertEqual(resultado["total"], 2)
        self.assertEqual(resultado["passaram"], 2)
        self.assertEqual(resultado["falharam"], 0)
        self.assertEqual(resultado["suites"]["unit-mobile"]["tempo"], 0.05)

    def test_suíte_com_falha_conta_detalhe_da_falha(self):
        resultado = metricas.coletar_metricas_xml(FIXTURES / "failure")

        self.assertEqual(resultado["total"], 2)
        self.assertEqual(resultado["passaram"], 1)
        self.assertEqual(resultado["falharam"], 1)
        self.assertEqual(resultado["falhas_detalhes"][0]["suite"], "e2e-mobile-web")
        self.assertEqual(resultado["falhas_detalhes"][0]["teste"], "MS-02 registra denúncia")

    def test_pasta_vazia_nao_gera_exceção(self):
        with tempfile.TemporaryDirectory() as pasta:
            resultado = metricas.coletar_metricas_xml(pasta)

        self.assertEqual(resultado["total"], 0)
        self.assertEqual(resultado["passaram"], 0)
        self.assertEqual(resultado["falharam"], 0)
        self.assertEqual(resultado["taxa_geral"], 0.0)

    def test_mobile_suite_budget_limits_exist(self):
        self.assertEqual(metricas.LIMITES_TEMPO["unit-mobile"], 60.0)
        self.assertEqual(metricas.LIMITES_TEMPO["e2e-mobile-web"], 300.0)


class MobileMetricsTests(unittest.TestCase):
    def test_backlog_counts_checked_items_and_total(self):
        with tempfile.TemporaryDirectory() as pasta:
            backlog = pathlib.Path(pasta) / "backlog.md"
            backlog.write_text(
                "| ID | Item | Status |\n"
                "| --- | --- | --- |\n"
                "| MS-01 | Gestor | ✅ |\n"
                "| ME-01 | Login | 🔲 |\n"
                "| Notes | Not a backlog item | ✅ |\n",
                encoding="utf-8",
            )

            resultado = metricas.coletar_cobertura_mobile(backlog)

        self.assertEqual(resultado["total"], 2)
        self.assertEqual(resultado["automatizados"], 1)
        self.assertEqual(resultado["taxa"], 50.0)

    def test_counts_registered_and_quarantined_flaky_tests(self):
        with tempfile.TemporaryDirectory() as pasta:
            raiz = pathlib.Path(pasta)
            (raiz / "resultados").mkdir()
            (raiz / "resultados-quarentena").mkdir()
            (raiz / "resultados" / "flaky-e2e.json").write_text(
                json.dumps([{"titulo": "A"}, {"titulo": "B"}]),
                encoding="utf-8",
            )
            (raiz / "resultados-quarentena" / "flaky-mobile.json").write_text(
                json.dumps([{"titulo": "C"}]),
                encoding="utf-8",
            )

            resultado = metricas.coletar_metricas_flaky(raiz)

        self.assertEqual(resultado["registrados"], 2)
        self.assertEqual(resultado["quarentena"], 1)
        self.assertEqual(resultado["arquivos_invalidos"], [])

    def test_empty_or_invalid_flaky_files_do_not_raise(self):
        with tempfile.TemporaryDirectory() as pasta:
            raiz = pathlib.Path(pasta)
            (raiz / "resultados").mkdir()
            (raiz / "resultados-quarentena").mkdir()
            (raiz / "resultados" / "flaky-invalid.json").write_text("{", encoding="utf-8")

            resultado = metricas.coletar_metricas_flaky(raiz)

        self.assertEqual(resultado["registrados"], 0)
        self.assertEqual(resultado["quarentena"], 0)
        self.assertEqual(len(resultado["arquivos_invalidos"]), 1)

    def test_reports_include_mobile_data_and_handle_no_mobile_xml(self):
        metricas_mobile = {
            "total": 3,
            "automatizados": 1,
            "taxa": 33.3,
            "pendentes": ["MS-02", "MS-03"],
        }
        flaky = {"registrados": 2, "quarentena": 1, "arquivos_invalidos": []}
        backlog = {"total": 11, "automatizados": 10, "taxa": 90.9, "pendentes": []}
        pipeline = {"total_runs": 7, "sucessos": 7, "taxa": 100.0, "dias": 7}
        resultado_com_mobile = metricas.coletar_metricas_xml(FIXTURES / "baseline")
        resultado_sem_mobile = metricas.coletar_metricas_xml(FIXTURES / "empty")

        with tempfile.TemporaryDirectory() as pasta:
            raiz = pathlib.Path(pasta)
            tecnico = raiz / "tecnico.html"
            negocio = raiz / "negocio.html"
            tecnico_vazio = raiz / "tecnico-vazio.html"
            negocio_vazio = raiz / "negocio-vazio.html"
            summary = raiz / "summary.md"

            semaforo = metricas.calcular_semaforo(resultado_com_mobile, backlog, pipeline)
            metricas.gerar_relatorio_tecnico_html(
                resultado_com_mobile, backlog, pipeline, semaforo, str(tecnico), metricas_mobile, flaky
            )
            metricas.gerar_relatorio_negocio_html(
                resultado_com_mobile, backlog, pipeline, semaforo, str(negocio), metricas_mobile, flaky
            )
            metricas.gerar_relatorio_tecnico_html(
                resultado_sem_mobile, backlog, pipeline, semaforo, str(tecnico_vazio), metricas_mobile, flaky
            )
            metricas.gerar_relatorio_negocio_html(
                resultado_sem_mobile, backlog, pipeline, semaforo, str(negocio_vazio), metricas_mobile, flaky
            )
            with patch.dict(os.environ, {"GITHUB_STEP_SUMMARY": str(summary)}):
                metricas.publicar_github_summary(
                    resultado_com_mobile, backlog, pipeline, semaforo, metricas_mobile, flaky
                )

            html_tecnico = tecnico.read_text(encoding="utf-8")
            html_negocio = negocio.read_text(encoding="utf-8")
            html_tecnico_vazio = tecnico_vazio.read_text(encoding="utf-8")
            html_negocio_vazio = negocio_vazio.read_text(encoding="utf-8")
            resumo = summary.read_text(encoding="utf-8")

        self.assertIn("unit-mobile", html_tecnico)
        self.assertIn("e2e-mobile-web", html_tecnico)
        self.assertIn("Falhas mobile nesta execução: <strong>1</strong>", html_tecnico)
        self.assertIn("Testes instáveis registrados: <strong>2</strong>", html_tecnico)
        self.assertIn("Fluxos protegidos no backlog", html_negocio)
        self.assertIn("não comprovam o funcionamento nativo", html_negocio)
        self.assertIn("Nenhuma suíte mobile foi executada", html_tecnico_vazio)
        self.assertIn("Nenhuma suíte mobile foi executada", html_negocio_vazio)
        self.assertIn("Qualidade Mobile", resumo)
        self.assertIn("Instáveis registrados / em quarentena | 2 / 1", resumo)


if __name__ == "__main__":
    unittest.main()
