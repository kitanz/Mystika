(async function() {
  const websocket = await fetch("/function?name=websocket");
  if (!websocket.ok) {
    throw new Error(`HTTP error! status: ${websocket.status}`);
  }
  const websocket_response = await websocket.json();
  if (!websocket_response || !websocket_response.script || !websocket_response.hash) {
    throw new Error("No websocket_response or script found");
  }
  const websocket_hash = await fetch(`/function/hash?name=websocket`);
  if (!websocket_hash.ok) {
    throw new Error(`HTTP error! status: ${websocket_hash.status}`);
  }
  if (websocket_response.hash !== (await websocket_hash.json()).hash) {
    throw new Error("Hash mismatch");
  }
  {
    try {
      new Function(websocket_response.script)();
    } catch (error) {
      console.error(error);
    }
  }
})();
