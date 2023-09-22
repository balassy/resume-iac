exports.handler = (event: AWSCloudFrontFunction.Event): AWSCloudFrontFunction.Request | AWSCloudFrontFunction.Response => {
  var request = event.request;
  var uri = request.uri;
  
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
