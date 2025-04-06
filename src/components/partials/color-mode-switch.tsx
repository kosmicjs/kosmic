import {getCtx} from '#server';

export function ColorModeSwitch() {
  const ctx = getCtx();
  const colorMode = ctx.cookies?.get('kosmic-color-mode');

  return (
    <div class="form-check form-switch">
      <input // eslint-disable-line react/checked-requires-onchange-or-readonly
        class="form-check-input"
        type="checkbox"
        role="switch"
        id="color-mode-switch"
        checked={colorMode ? true : undefined}
      />
      <label class="form-check-label" for="color-mode-switch">
        Theme
      </label>
    </div>
  );
}

export default ColorModeSwitch;
