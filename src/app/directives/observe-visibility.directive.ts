import { Directive, ElementRef, inject, output, OnDestroy, afterNextRender } from '@angular/core';

@Directive({
  selector: '[appObserveVisibility]',
  standalone: true,
})
export class ObserveVisibilityDirective implements OnDestroy {
  private elementRef = inject(ElementRef);
  visible = output<void>();

  private observer: IntersectionObserver | undefined;

  constructor() {
    afterNextRender(() => {
        this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.visible.emit();
            }
          });
        },
        { threshold: 0.1 } // Trigger when 10% of the element is visible
      );
      this.observer.observe(this.elementRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
