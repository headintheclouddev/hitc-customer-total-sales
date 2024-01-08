/**
 * setTotalSalesSS_done.ts
 *
 * @NScriptName Set Customer Total Sales - SS - Done
 * @NScriptType ScheduledScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/log", "N/query", "N/record"], function (require, exports, log, query, record) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execute = void 0;
    function execute() {
        const customerResults = query.runSuiteQL({
            query: `SELECT entity FROM transaction WHERE tranDate = BUILTIN.RELATIVE_RANGES('TODAY', 'START') AND type IN ('CashSale', 'CustInvc', 'CustCred')`
        }).asMappedResults();
        log.debug('execute', `Customer results: ${JSON.stringify(customerResults)}.`);
        const customerIds = [];
        for (const result of customerResults) {
            customerIds.push(result.entity);
        }
        const results = query.runSuiteQL({
            query: `SELECT entity, SUM(foreignTotal) AS total FROM transaction WHERE entity IN (${customerIds.join(',')}) AND type IN ('CashSale', 'CustInvc', 'CustCred') GROUP BY entity`
        }).asMappedResults();
        log.debug('execute', `Sales results: ${JSON.stringify(results)}.`);
        for (const result of results) {
            log.debug('execute', `Updating customer ${result.entity} with total ${result.total} at ${new Date()}.`);
            record.submitFields({ type: 'customer', id: result.entity, values: { custentity_total_sales: result.total } });
        }
        log.audit('execute', `Execution finished at ${new Date()}.`);
    }
    exports.execute = execute;
});
