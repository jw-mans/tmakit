import { useEffect } from 'react';
import { useTmaBridge } from './bridge';

/**
 * Declarative, headless button components. Render `<MainButton text="Save" .../>`
 * where the button should be active; it sets the native button up on mount/update and
 * hides it on unmount, so buttons follow your render tree instead of drifting between
 * screens. Each renders nothing.
 */

export interface MainButtonProps {
  text: string;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  progress?: boolean;
  onClick?: () => void;
}

export function MainButton(props: MainButtonProps) {
  const bridge = useTmaBridge();
  const { text, color, textColor, disabled, progress, onClick } = props;

  useEffect(() => {
    bridge.postEvent?.('web_app_setup_main_button', {
      is_visible: true,
      is_active: !disabled,
      is_progress_visible: !!progress,
      text,
      color,
      text_color: textColor,
    });
  }, [bridge, text, color, textColor, disabled, progress]);

  // Hide once on unmount (separate from updates to avoid flicker).
  useEffect(() => () => bridge.postEvent?.('web_app_setup_main_button', { is_visible: false }), [bridge]);

  useEffect(() => {
    if (!onClick) return;
    return bridge.on('main_button_pressed', onClick);
  }, [bridge, onClick]);

  return null;
}

export interface SecondaryButtonProps extends MainButtonProps {
  position?: 'left' | 'right' | 'top' | 'bottom';
}

export function SecondaryButton(props: SecondaryButtonProps) {
  const bridge = useTmaBridge();
  const { text, color, textColor, disabled, progress, position, onClick } = props;

  useEffect(() => {
    bridge.postEvent?.('web_app_setup_secondary_button', {
      is_visible: true,
      is_active: !disabled,
      is_progress_visible: !!progress,
      text,
      color,
      text_color: textColor,
      position,
    });
  }, [bridge, text, color, textColor, disabled, progress, position]);

  useEffect(() => () => bridge.postEvent?.('web_app_setup_secondary_button', { is_visible: false }), [bridge]);

  useEffect(() => {
    if (!onClick) return;
    return bridge.on('secondary_button_pressed', onClick);
  }, [bridge, onClick]);

  return null;
}

export interface BackButtonProps {
  onClick?: () => void;
  visible?: boolean;
}

export function BackButton({ onClick, visible = true }: BackButtonProps) {
  const bridge = useTmaBridge();

  useEffect(() => {
    bridge.postEvent?.('web_app_setup_back_button', { is_visible: visible });
  }, [bridge, visible]);

  useEffect(() => () => bridge.postEvent?.('web_app_setup_back_button', { is_visible: false }), [bridge]);

  useEffect(() => {
    if (!onClick) return;
    return bridge.on('back_button_pressed', onClick);
  }, [bridge, onClick]);

  return null;
}

export interface UseBackButtonRouterOptions {
  /** Show the back button when the user can go back (e.g. history depth > 1). */
  canGoBack: boolean;
  /** Called when the hardware/native back button is pressed. */
  onBack: () => void;
}

/**
 * Wire the native BackButton to a router: visible while `canGoBack`, and `onBack` on
 * press. Also covers Android hardware-back, which the client maps to the same event.
 */
export function useBackButtonRouter(options: UseBackButtonRouterOptions): void {
  const bridge = useTmaBridge();
  const { canGoBack, onBack } = options;

  useEffect(() => {
    bridge.postEvent?.('web_app_setup_back_button', { is_visible: canGoBack });
  }, [bridge, canGoBack]);

  useEffect(() => () => bridge.postEvent?.('web_app_setup_back_button', { is_visible: false }), [bridge]);

  useEffect(() => bridge.on('back_button_pressed', onBack), [bridge, onBack]);
}
