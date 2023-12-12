/**
 * AWS CloudFront handler that redirects all incoming requests to the APEX domain.
 * @param {AWSCloudFrontFunction.Event} event Properties of the incoming request.
 * @returns {AWSCloudFrontFunction.Request | AWSCloudFrontFunction.Response}
 */
exports.handler = (event) => {
  var request = event.request;
  
  if (request.headers.host) {
    const host = request.headers.host.value;
    if (host === 'www.balassy.me') {
      return {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: {
          location: { value: `balassy.me${request.uri}` }
        }
      }
    }
  }
  
  return request;
}
