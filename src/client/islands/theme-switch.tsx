import {useState} from 'preact/hooks';
import {setCookie} from '../scripts/cookies.js';

export type Props = {
  readonly isChecked?: boolean;
};

const Sun = <i class="bi bi-sun"></i>;
const Moon = <i class="bi bi-moon-stars"></i>;

export function ThemeSwitch({isChecked = false}: Props = {}) {
  const [colorMode, setColorMode] = useState(isChecked ? Sun : Moon);
  const [isCheckedState, setIsCheckedState] = useState(isChecked);

  return (
    <div class="form-check form-switch">
      <input
        class="form-check-input"
        type="checkbox"
        role="switch"
        id="color-mode-switch"
        checked={isCheckedState}
        onChange={(ev) => {
          const colorMode = ev.currentTarget.checked ? 'light' : 'dark';
          setCookie('kosmic-color-mode', colorMode);
          setColorMode(ev.currentTarget.checked ? Sun : Moon);
          setIsCheckedState(ev.currentTarget.checked);
          const body = document.querySelector('body');
          if (body instanceof HTMLBodyElement) {
            body.dataset.bsTheme = colorMode;
          }
        }}
      />
      <label class="form-check-label" for="color-mode-switch">
        {colorMode}
      </label>
    </div>
  );
}

export function ThemeSwitchIsland(props: Props) {
  return (
    <div data-island="theme-switch" data-props={JSON.stringify(props)}>
      <ThemeSwitch {...props} />
    </div>
  );
}

export default ThemeSwitch;
