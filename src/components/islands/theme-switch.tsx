import {useState} from 'preact/hooks';

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
          const setCookie = (name: string, value: string, days = 30): void => {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
          };

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
