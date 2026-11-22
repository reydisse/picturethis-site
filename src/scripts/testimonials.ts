export function initializeTestimonials(track: HTMLElement) {
  const slides = [...track.querySelectorAll<HTMLElement>(':scope > figure')];
  const band = track.closest('section')!;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = document.createElement('div');
  controls.className = 'testimonial-controls';
  let active = 0;
  let timer: number | undefined;

  function select(index: number) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== active;
      dots[i].setAttribute('aria-pressed', String(i === active));
    });
  }

  function stop() {
    window.clearInterval(timer);
  }

  function start() {
    stop();
    if (!motion.matches && !band.matches(':hover, :focus-within')) {
      timer = window.setInterval(() => select(active + 1), 12000);
    }
  }

  function control(label: string, text: string, index: () => number) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => {
      select(index());
      start();
    });
    controls.append(button);
    return button;
  }

  control('Previous testimonial', '←', () => active - 1);
  const dots = slides.map((_, index) => control(`Show testimonial ${index + 1}`, '', () => index));
  control('Next testimonial', '→', () => active + 1);
  track.after(controls);
  band.addEventListener('mouseenter', stop);
  band.addEventListener('mouseleave', start);
  band.addEventListener('focusin', stop);
  band.addEventListener('focusout', () => setTimeout(start, 0));
  motion.addEventListener('change', start);
  select(0);
  start();
}
