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

    /**
     * Get the batch request.
     */
    getBatchRequest() {
        return this.batchRequest;
    }

    /**
     * Set the batch request.
     */
    setBatchRequest(batchRequest) {
        this.batchRequest = batchRequest;
    }

    /**
     * NOT IMPLEMENTED Logical Analysis Stage of Compilation.
     * 
     * Reduces redundant requests using Gmail API method names.
     */
    compileBatchRequests() {
        return; // todo complete this method
    }

    /**
     * Execute the batch API request using Gmail REST API (v1).
     *
     * @returns {Object|null} - The response of the batch request. null if error. Object if success.
     * @see {@method GmailApi#compileBatchRequests}
     * @see {@method GmailApi#setBatchRequest}
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

        console.info(JSON,stringify({
            batchRequest: {
                request: this.getBatchRequest(),
                response: res,
            },
        }));
        this.setBatchRequest([]);
        return res;
    }

    static getRequest({ name, parameters }) {
        const requestTemplate = this.requestTemplates[name](parameters);
        const queryString = parameters.queryParameters
            ? Object.entries(parameters.queryParameters)
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value
                            .map(val => `${key}=${encodeURIComponent(val)}`)
                            .join('&');
                    } else {
                        return `${key}=${encodeURIComponent(value)}`;
                    }
                })
                .join('&')
            : null;

        return {
            ...requestTemplate,
            endpoint: `${requestTemplate.endpoint}${queryString ? `?${queryString}` : ''}`,
            ...((({ pathParameters, queryParameters, ...others }) => others)(parameters))
        };
    }
}
