import { PlaywrightCrawler, Dataset, log } from 'crawlee';

log.setLevel(log.LEVELS.INFO);

const START_URL = 'https://contrataciondelestado.es/wps/myportal/plataforma/buscadores/busqueda';

// Configuración principal
const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 3,
  maxConcurrency: 1,
  launchContext: {
    launchOptions: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  },

  async requestHandler({ page, request }) {
    log.info(`Abriendo: ${request.url}`);

    await page.goto(START_URL, { waitUntil: 'networkidle' });

    // Esperar el iframe donde están los resultados
    await page.waitForSelector('iframe[id*="busquedaFrame"], iframe[src*="busqueda"]', { timeout: 15000 });

    const frames = page.frames();
    const targetFrame = frames.find(f => f.url().includes('busqueda') || f.name().includes('busqueda'));
    if (!targetFrame) {
      log.error('❌ No se encontró el iframe con los resultados.');
      return;
    }

    // Esperar tabla de resultados
    await targetFrame.waitForSelector('.tablaResultado tbody tr', { timeout: 15000 });

    // Extraer datos de las licitaciones
    const data = await targetFrame.$$eval('.tablaResultado tbody tr', rows => {
      return rows.map(r => ({
        titulo: r.querySelector('td:nth-child(2) a')?.innerText?.trim(),
        enlace: r.querySelector('td:nth-child(2) a')?.href,
        fecha_publicacion: r.querySelector('td:nth-child(3)')?.innerText?.trim(),
        estado: r.querySelector('td:nth-child(4)')?.innerText?.trim(),
        organo_contratacion: r.querySelector('td:nth-child(5)')?.innerText?.trim(),
      }));
    });

    log.info(`✅ ${data.length} licitaciones extraídas.`);
    await Dataset.pushData(data);
  },

  failedRequestHandler({ request }) {
    log.error(`❌ Falló la petición: ${request.url}`);
  },
});

await crawler.run([START_URL]);
log.info('🟢 Scraping completado.');
