import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  effect
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent, ProgressComponent } from '@factor_ec/ui';
import { LayoutManager } from '@/core/services/layout-manager';
import { RequirementRepository } from '../../repositories/requirement-repository';

/**
 * Displays the detail view of a Requirement.
 *
 * @remarks
 * This component renders the Requirement's data including all RequirementItems.
 * It relies on the route parameter to load the Requirement from the {@link RequirementRepository}.
 */
@Component({
  selector: 'app-requirement-detail',
  imports: [CommonModule, MatButtonModule, IconComponent, ProgressComponent],
  templateUrl: './requirement-detail.html',
  styleUrl: './requirement-detail.css',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequirementDetailComponent implements OnInit, OnDestroy {
  // Dependency injection
  private readonly requirementRepository = inject(RequirementRepository);
  public readonly layoutManager = inject(LayoutManager);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Properties
  public readonly requirement = this.requirementRepository.find();

  constructor() {
    effect(() => {
      const change = this.requirementRepository.change();
      if (!change) return;
      this.requirement.refresh();
    });
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        await this.requirement.load(Number(id));
      } catch {
        this.router.navigate(['/requirements']);
      }
    }
  }

  ngOnDestroy(): void {
    this.requirement.destroy();
  }

  public viewItemDetail(itemId: number): void {
    this.router.navigate(['/requirements', this.requirement.value()?.id, 'items', itemId]);
  }

  public goBack(): void {
    this.router.navigate(['/requirements']);
  }
}
