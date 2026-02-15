import * as os from 'os';
import { Logger } from '@nestjs/common';

const logger = new Logger('PerformanceMonitor');

function checkPerformance() {
    const cpus = os.cpus();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;

    const loadAvg = os.loadavg();

    logger.log(`CPU Cores: ${cpus.length}`);
    logger.log(`Memory Usage: ${memUsage.toFixed(2)}% (${(freeMem / 1024 / 1024).toFixed(0)}MB free)`);
    logger.log(`Load Average (1m, 5m, 15m): ${loadAvg.join(', ')}`);

    if (memUsage > 80) {
        logger.warn('HIGH MEMORY USAGE DETECTED');
    }

    if (loadAvg[0] > cpus.length * 0.8) {
        logger.warn('HIGH CPU LOAD DETECTED');
    }
}

// Run every 10 seconds
setInterval(checkPerformance, 10000);

logger.log('Performance monitoring started...');
