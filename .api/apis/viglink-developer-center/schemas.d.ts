declare const GetProductRecommendations: {
    readonly body: {
        readonly type: "object";
        readonly properties: {
            readonly title: {
                readonly type: "string";
                readonly description: "Short descriptive title for the content (optional).";
            };
            readonly content: {
                readonly type: "string";
                readonly description: "The content to generate recommendations for (HTML, plain text, etc.).";
            };
        };
        readonly required: readonly ["content"];
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly apiKey: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Your Sovrn Commerce API key. Found in the Sovrn Platform under Site Settings or via the Campaigns API.";
                };
                readonly market: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Market in the format currency_language (e.g., usd_en). Inferred from IP if not provided.";
                };
                readonly cuid: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Custom tracking ID for associating recommendations with a specific user, session, or page.";
                };
                readonly priceRange: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Price filter using \"min-max\" format, e.g., \"20-50\" or \"*-25\".";
                };
                readonly includeMerchants: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Comma separated list of merchant IDs to include. Only one of includeMerchants or excludeMerchants may be used.";
                };
                readonly excludeMerchants: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Comma separated list of merchant IDs to exclude. Only one of includeMerchants or excludeMerchants may be used.";
                };
                readonly numProducts: {
                    readonly type: "integer";
                    readonly default: 4;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Number of products to return. Default: 4, Max: 50.";
                };
                readonly pageUrl: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The URL of the page you want recommendations for. Can be a real page or a placeholder. Used for caching.";
                };
            };
            readonly required: readonly ["apiKey", "pageUrl"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "integer";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly imageURL: {
                        readonly type: "string";
                    };
                    readonly thumbnailURL: {
                        readonly type: "string";
                    };
                    readonly currency: {
                        readonly type: "string";
                    };
                    readonly salePrice: {
                        readonly type: "number";
                    };
                    readonly retailPrice: {
                        readonly type: "number";
                    };
                    readonly discountRate: {
                        readonly type: "number";
                    };
                    readonly inStock: {
                        readonly type: "boolean";
                    };
                    readonly affiliatable: {
                        readonly type: "boolean";
                    };
                    readonly deepLink: {
                        readonly type: "string";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
export { GetProductRecommendations };
