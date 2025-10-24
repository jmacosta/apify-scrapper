// src/main.js
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: true, // usar false solo para depuración local
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🌐 Navegando al portal de contratación...');
    await page.goto(
      'https://contrataciondelestado.es/wps/portal/plataforma/inicio/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8zinYItLBydDB0NDIxDLQwczQIDnS1dDIwMLI31wwkpiAJKG-AAjgZA_VFgJabGziZhXmEBZsGe7gYGnh5uLj6hhqYG7kZmUAV4zCjIjTDIdFRUBAD_nKPx/dz/d5/L2dBISEvZ0FBIS9nQSEh/',
      { waitUntil: 'networkidle' }
    );

    // === Pasos grabados desde recorded.js ===
    await page.getByRole('link', { name: 'Buscadores Licitaciones,' }).click();
    await page.getByRole('link', { name: 'Licitaciones Búsqueda de' }).click();
    await page.getByRole('link', { name: 'Selección CPV' }).click();

    // Ejemplo: seleccionando CPV de marketing y publicidad
    await page.locator('#j_a0_40').click();
    await page.locator('#j_a0_48').click();
    await page.locator('#j_a0_58').click();
    await page.locator('#j_a0_59').click();
    await page.getByRole('link', { name: 'Carpeta 79341100-Servicios de' }).click();
    await page.getByRole('link', { name: 'Carpeta 79341200-Servicios de' }).click();
    await page.getByRole('link', { name: 'Carpeta 79341400-Servicios de' }).click();
    await page.locator('#j_a0_60').click();
    await page.getByRole('link', { name: 'Carpeta cerrada 79342300-' }).click();
    await page.getByRole('button', { name: 'Aceptar' }).click();

    // Estado = Publicado
    await page.getByLabel('Estado').selectOption('PUB');

    // Iniciar búsqueda
    await page.locator(
      'input[name="viewns_Z7_AVEQAI930OBRD02JPMTPG21004_:form1:button1"]'
    ).click();

    console.log('🔍 Esperando resultados de licitaciones...');
    await page.waitForSelector('table#myTablaBusquedaCustom > tbody > tr', { timeout: 60000 });

    // Extraer datos
    const rows = await page.$$eval('table#myTablaBusquedaCustom > tbody > tr', trs =>
      trs.map(tr => {
        const expediente = tr.querySelector('td:first-child span')?.innerText?.trim() || '';
        const descripcion = tr.querySelector('td:first-child > div:not(.cell-order)')?.innerText?.trim() || '';
        const tipo = tr.querySelector('td:nth-child(2)')?.innerText?.trim() || '';
        const estado = tr.querySelector('td:nth-child(3)')?.innerText?.trim() || '';
        const importe = tr.querySelector('td:nth-child(4)')?.innerText?.trim() || '';
        const presentacion = tr.querySelector('td:nth-child(5)')?.innerText?.trim() || '';
        const organismo = tr.querySelector('td:nth-child(6)')?.innerText?.trim() || '';
        return { expediente, descripcion, tipo, estado, importe, presentacion, organismo };
      })
    );

    console.log(`✅ ${rows.length} licitaciones extraídas.`);
    console.log(JSON.stringify(rows, null, 2));

  } catch (err) {
    console.error('❌ Error durante la ejecución:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
