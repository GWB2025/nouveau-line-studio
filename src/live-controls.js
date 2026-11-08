/**
 * Coalesce rapid slider input events into one render per animation frame.
 * The callback reads current controls when the frame runs, so no intermediate
 * or obsolete values can overwrite the latest position of the slider.
 */
export function createFrameUpdater(render, scheduleFrame) {
  let pending = false;
  return function requestPreview() {
    if (pending) return;
    pending = true;
    scheduleFrame(() => {
      pending = false;
      render();
    });
  };
}