/**
 * AWS CloudFront handler that redirects all incoming requests to the default document and from www to the apex domain.
 * @param {AWSCloudFrontFunction.Event} event Properties of the incoming request.
 * @returns {AWSCloudFrontFunction.Request | AWSCloudFrontFunction.Response}
 */
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Redirect to apex domain.
  if (request.headers.host) {
    var host = request.headers.host.value;
    if (host === 'www.balassy.me') {
      return {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: {
          location: { value: `https://balassy.me${request.uri}` }
        }
      }
    }
  }  
  
  // Check whether the URL is missing a file name.
  if (uri.endsWith('/')) {
      request.uri += 'index.html';
  } 
  // Check whether the URL is missing a file extension.
  else if (!uri.includes('.')) {
      request.uri += '/index.html';
  }

  return request;
}