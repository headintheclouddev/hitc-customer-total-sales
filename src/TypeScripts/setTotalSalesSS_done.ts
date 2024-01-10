/**
 * setTotalSalesSS_done.ts
 *
 * @NScriptName Set Customer Total Sales - SS - Done
 * @NScriptType ScheduledScript
 * @NApiVersion 2.1
 */

import log = require('N/log');
import query = require('N/query');
import record = require('N/record');

export function execute() {
    const customerResults: { entity: number }[] = query.runSuiteQL({ // Find customers who had a sales order today
        query: `SELECT entity FROM transaction WHERE tranDate = BUILTIN.RELATIVE_RANGES('TODAY', 'START') AND type IN ('CashSale', 'CustInvc', 'CustCred')`
    }).asMappedResults() as any;
    log.debug('execute', `Customer results: ${JSON.stringify(customerResults)}.`);
    const customerIds: number[] = [];
    for (const result of customerResults) {
        customerIds.push(result.entity);
    }
    const results: { entity: number, total: number }[] = query.runSuiteQL({
        query: `SELECT entity, SUM(foreignTotal) AS total FROM transaction WHERE entity IN (${customerIds.join(',')}) AND type IN ('CashSale', 'CustInvc', 'CustCred') GROUP BY entity`
    }).asMappedResults() as any;
    log.debug('execute', `Sales results: ${JSON.stringify(results)}.`);
    for (const result of results) {
        log.debug('execute', `Updating customer ${result.entity} with total ${result.total} at ${new Date()}.`);
        record.submitFields({ type: 'customer', id: result.entity, values: { custentity_total_sales: result.total } });
    }
    log.audit('execute', `Execution finished at ${new Date()}.`);
}
