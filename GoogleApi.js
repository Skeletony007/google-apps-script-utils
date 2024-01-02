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
   * @see { @link https://developers.google.com/apps-script/guides/support/best-practices#avoid_libraries_in_ui-heavy_scripts }
   */
  executeBatchRequest() {
    this.compileBatchRequests();

    let res;
    try {
      res = EDo({ batchPath: this.batchPath, requests: this.batchRequest });
    } catch (error) {
      console.error('Error in executeBatchRequest:', error);
      return null;
    }

    this.setBatchRequest([]);
    return res;
  }
}
