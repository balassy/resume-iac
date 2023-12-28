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
    var currentHost = request.headers.host.value;
    var targetHost = '';
    switch (currentHost) {
      case 'www.balassy.me':
        targetHost = 'balassy.me';
        break;
      case 'www.staging.balassy.me':
        targetHost = 'staging.balassy.me';
        break;
    }

    if (!!targetHost) {
      return {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: {
          location: { value: `https://${targetHost}${request.uri}` }
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