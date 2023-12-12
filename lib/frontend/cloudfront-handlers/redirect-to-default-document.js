/**
 * AWS CloudFront handler that redirects all incoming requests to the default document.
 * @param {AWSCloudFrontFunction.Event} event Properties of the incoming request.
 * @returns {AWSCloudFrontFunction.Request | AWSCloudFrontFunction.Response}
 */
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // Check whether the URI is missing a file name.
  if (uri.endsWith('/')) {
      request.uri += 'index.html';
  } 
  // Check whether the URI is missing a file extension.
  else if (!uri.includes('.')) {
      request.uri += '/index.html';
  }

  return request;
}