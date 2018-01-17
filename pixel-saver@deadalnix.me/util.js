const Mainloop = imports.mainloop;
const Meta = imports.gi.Meta;

const MAXIMIZED = Meta.MaximizeFlags.BOTH;

function getWindow() {
	// get all window in stacking order.
	let win = global.display.focus_window;
	let windows = global.display.sort_windows_by_stacking(
		global.screen.get_active_workspace().list_windows().filter(function (w) {
			return w.get_window_type() !== Meta.WindowType.DESKTOP;
		})
	);

	if (win === null || win.get_window_type() === Meta.WindowType.DESKTOP) {
		// No windows are active, control the uppermost window on the
		// current workspace
		if (windows.length) {
			win = windows[windows.length - 1];
			if(!('get_maximized' in win)) {
				win = win.get_meta_window();
			}
		}
	}
	return win;
}

function onSizeChange(callback) {
	let callbackIDs = [];
	let wm = global.window_manager;
	
	// Obvious size change callback.
	callbackIDs.push(wm.connect('size-change', callback));
	
	// Needed for window drag to top panel (this doesn't trigger maximize).
	callbackIDs.push(wm.connect('hide-tile-preview', callback));
	
	// NB: 'destroy' needs a delay for .list_windows() report correctly
	callbackIDs.push(wm.connect('destroy', function () {
		Mainloop.idle_add(callback);
	}));
	
	return callbackIDs;
}

