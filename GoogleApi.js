class GoogleApi {
  /**
    * Constructor for GoogleApi.
    * @param {string} batchPath - The batch path for API requests.
    * @see { @link https://developers.google.com/drive/api/guides/performance#details }
    * @see { @link https://github.com/tanaikech/BatchRequest#method-edo }
    */
  constructor(batchPath) {
    this.batchPath = batchPath
  }

  getBatchRequest() {
    return this.batchRequest;
  }

  setBatchRequest(batchRequest) {
    this.batchRequest = batchRequest;
  }

  /**
   * (NOT IMPLEMENTED) Logical Analysis Stage of Compilation.
   * 
   * Reduces redundant requests using `apiMethod()` identifiers
   */
  compileBatchRequests() {
    return; // todo complete this method
  }

  /**
   * Execute the batch API request using Gmail REST API (v1).
   *
   * @returns {Object|null} - The response of the batch request.
   */
  executeBatchRequest() {
    this.compileBatchRequests();

    let res;
    try {
      res = new BatchRequest({
        batchPath: this.batchPath,
        requests: this.batchRequest
      }).EDo();
    } catch (error) {
      console.error('Error in executeBatchRequest:', error);
      return null;
    }

    this.setBatchRequest([]);
    return res;
  }
}
