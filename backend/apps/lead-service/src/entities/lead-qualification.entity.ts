 
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
 
import { Lead } from './lead.entity';
 
@Entity('lead_qualifications')
export class LeadQualification {
  @PrimaryGeneratedColumn('uuid')
  id: string;
 
  @OneToOne(() => Lead, (lead) => lead.qualification, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;
 
  @Column({
    name: 'has_approved_budget',
    type: 'boolean',
    default: false,
  })
  hasApprovedBudget: boolean;
 
  @Column({ length: 255, nullable: true })
  budget: string;
 
  @Column({ length: 255, nullable: true })
  bant: string;
 
  @Column({ name: 'has_need', length: 100, nullable: true })
  hasNeed: string;
 
  @Column({ length: 255, nullable: true })
  need: string;
 
  @Column({ name: 'who_is_the_authority', length: 255, nullable: true })
  whoIsTheAuthority: string;
 
  @Column({ length: 255, nullable: true })
  authority: string;
 
  @Column({ length: 255, nullable: true })
  timeline: string;
 
  @Column({
    name: 'do_we_know_the_timeline',
    length: 100,
    nullable: true,
  })
  doWeKnowTheTimeline: string;
 
  @Column({
    name: 'qualification_status',
    length: 100,
    nullable: true,
  })
  qualificationStatus: string;
 
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  score: string;
 
  @Column({ type: 'text', nullable: true })
  notes: string;
 
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
 
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
 