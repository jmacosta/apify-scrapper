import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({
    headless: true, // cambia a false si quieres ver lo que hace
    slowMo: 200, // retrasa acciones para depuración
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(90000); // 90 segundos de timeout global

  try {
    console.log("🚀 Iniciando flujo de navegación...");
    await page.goto("https://contrataciondelestado.es/wps/portal/plataforma/inicio/", {
      waitUntil: "networkidle",
    });
    console.log("🌍 Página principal cargada.");

    // Primer click: abrir menú “Buscadores Licitaciones”
    console.log("🧭 Abriendo 'Buscadores Licitaciones'...");
    await page.getByRole("link", { name: "Buscadores Licitaciones," }).click();
    await page.waitForLoadState("networkidle");
    console.log("✅ Menú de buscadores cargado.");

    // Segundo click: abrir “Licitaciones Búsqueda de”
    console.log("🔍 Buscando enlace de licitaciones...");
    await page.waitForSelector('a[href*="licitaciones-busqueda"]', { timeout: 60000 });
    await page.click('a[href*="licitaciones-busqueda"]');
    await page.waitForLoadState("networkidle");
    console.log("✅ Página de búsqueda de licitaciones abierta.");

    // Aquí continúa tu flujo: selección de CPV, fechas, etc.
    // Por ejemplo:
    /*
    await page.fill("#txtCPV", "79");
    await page.click("#btnBuscar");
    await page.waitForLoadState("networkidle");
    */

    console.log("🎯 Navegación completada correctamente.");

    // Guarda un pantallazo final
    await page.screenshot({ path: "final.png", fullPage: true });
    console.log("📸 Captura final guardada como 'final.png'.");

  } catch (err) {
    console.error("❌ Error durante la ejecución:", err);
    try {
      await page.screenshot({ path: "error.png", fullPage: true });
      console.log("⚠️ Captura de error guardada como 'error.png'.");
    } catch {
      console.log("⚠️ No se pudo guardar la captura de error.");
    }
    process.exitCode = 1;
  } finally {
    await browser.close();
    console.log("👋 Navegador cerrado. Ejecución finalizada.");
  }
})();
