const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navegando a la página principal...');
    await page.goto('https://contrataciondelestado.es/wps/portal/plataforma/buscadores/busqueda/', {
      waitUntil: 'networkidle',
    });

    // ===============================
    // === SECCIÓN GRABADA (recorded.js)
    // ===============================
    await page.getByRole('button', { name: 'Abrir buscador CPV' }).click();

    const popup = await page.waitForEvent('popup');
    await popup.getByPlaceholder('Buscar por código o descripción').click();
    await popup.getByPlaceholder('Buscar por código o descripción').fill('79');
    await popup.getByRole('button', { name: 'Buscar' }).click();

    await popup.waitForSelector('tbody tr td:first-child'); // esperar resultados
    await popup.getByRole('cell', { name: '79', exact: true }).click();
    await popup.getByRole('button', { name: 'Aceptar' }).click();

    // Cierra el popup automáticamente cuando desaparece
    await popup.close().catch(() => {});

    console.log('CPV seleccionado correctamente.');

    // Click en botón buscar
    await page.getByRole('button', { name: 'Buscar' }).click();

    // ===============================
    // === EXTRACCIÓN DE RESULTADOS
    // ===============================
    console.log('Esperando resultados...');
    await page.waitForSelector('table#myTablaBusquedaCustom > tbody > tr', { timeout: 60000 });

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

    // === OPCIONAL: guarda dataset (para Apify)
    // const dataset = await Apify.openDataset();
    // await dataset.pushData(rows);

  } catch (err) {
    console.error('❌ Error durante la ejecución:', err);
    throw err;
  } finally {
    await browser.close();
  }
})();
