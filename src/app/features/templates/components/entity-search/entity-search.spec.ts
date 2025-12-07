import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySearch } from './entity-search';

describe('EntitySearch', () => {
  let component: EntitySearch;
  let fixture: ComponentFixture<EntitySearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntitySearch]
    }).compileComponents();

    fixture = TestBed.createComponent(EntitySearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
