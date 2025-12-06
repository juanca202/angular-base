import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDetail } from './entity-detail';

describe('EntityDetail', () => {
  let component: EntityDetail;
  let fixture: ComponentFixture<EntityDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityDetail]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
