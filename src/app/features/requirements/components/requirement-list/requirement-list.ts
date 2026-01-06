import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  effect
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent, ProgressComponent } from '@factor_ec/ui';
import { LayoutManager } from '@/core/services/layout-manager';
import { RequirementRepository } from '../../repositories/requirement-repository';

/**
 * Displays the list of Requirements.
 *
 * @remarks
 * The component loads data through {@link RequirementRepository} and allows
 * users to navigate to requirement details.
 */
@Component({
  selector: 'app-requirement-list',
  imports: [CommonModule, MatButtonModule, IconComponent, ProgressComponent],
  templateUrl: './requirement-list.html',
  styleUrl: './requirement-list.css',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequirementListComponent implements OnInit, OnDestroy {
  // Dependency injection
  private readonly requirementRepository = inject(RequirementRepository);
  public readonly layoutManager = inject(LayoutManager);
  private readonly router = inject(Router);

  // Properties
  public readonly requirements = this.requirementRepository.findBy();

  constructor() {
    effect(() => {
      const change = this.requirementRepository.change();
      if (!change) return;
      this.requirements.refresh();
    });
  }

  ngOnInit(): void {
    this.requirements.load(undefined, { notifyError: false });
  }

  ngOnDestroy(): void {
    this.requirements.destroy();
  }

  public viewDetail(id: number): void {
    this.router.navigate(['/requirements', id]);
  }
}
