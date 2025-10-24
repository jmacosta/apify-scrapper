


import { chromium } from 'playwright';
import fs from 'fs/promises';

(async () => {
    // URL inicial de la búsqueda de licitaciones
    const START_URL = 'https://contrataciondelestado.es/wps/portal/plataforma/buscadores/busqueda/!ut/p/z1/jY9LT8MwEIR_C4dcvVvnARzTPF0VNRCcNL5UbgnIKK5DHvx-DOq1oXub1TczuyBgD-Isv9WHnJQ5y87qRgQHL9lFUZpTfCjdGOk25jzIrcx8qP8A3428alMVQckyRJan8ZavfMxoAOIWP16ZEG_zLwBiOb4GsVxBL8DSi_-VNPbI-0NYJc8he3Rxt36xFZvi6bXI6ArRg_I342Q0UUdN3uWpHUlvhqlrJ1KxpGYxNA5-jr2Dx3n8mts36WBqBj13clBmfdkRS0CvOd-jKrQO734AYHmecg!!/dz/d5/L2dBISEvZ0FBIS9nQSEh/p0/IZ7_AVEQAI930OBRD02JPMTPG21004=CZ6_4EOCCFH208S3D02LDUU6HH20G5=LA0=Ecom.ibm.faces.portlet.VIEWID!QCPjspQCPbusquedaQCPFormularioBusqueda.jsp==/#Z7_AVEQAI930OBRD02JPMTPG21004';

    // Lanzar navegador Chromium en modo headless
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`Navegando a: ${START_URL}`);
    await page.goto(START_URL, { waitUntil: 'domcontentloaded' });

    // Esperar a que cargue la tabla principal
    await page.waitForSelector('table#myTablaBusquedaCustom > tbody > tr');

    // Extraer licitaciones
    const licitaciones = await page.$$eval('table#myTablaBusquedaCustom > tbody > tr', rows => {
        return rows.map(row => {
            const celdas = row.querySelectorAll('td');
            const tituloDiv = celdas[0].querySelector('div:not(.cell-order)');
            const enlace = celdas[0].querySelector('a[target="_blank"]')?.href || null;
            return {
                titulo: tituloDiv?.textContent.trim() || '',
                enlace,
                tipo: celdas[1]?.textContent.trim() || '',
                estado: celdas[2]?.textContent.trim() || '',
                presupuesto: celdas[3]?.textContent.trim() || '',
                fecha: celdas[4]?.textContent.trim() || ''
            };
        });
    });

    console.log(`Se encontraron ${licitaciones.length} licitaciones.`);
    
    // Guardar resultados en JSON
    await fs.writeFile('licitaciones.json', JSON.stringify(licitaciones, null, 2));
    console.log('Archivo licitaciones.json guardado.');

    await browser.close();
})();
