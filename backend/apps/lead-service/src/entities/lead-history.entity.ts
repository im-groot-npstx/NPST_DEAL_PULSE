 
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
 
import { Lead } from './lead.entity';
 
@Entity('lead_history')
@Index(['leadId', 'createdAt'])
export class LeadHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;
 
  @Column({ name: 'lead_id', type: 'char', length: 36 })
  leadId: string;
 
  @ManyToOne(() => Lead, (lead) => lead.history, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;
 
  @Column({ length: 100 })
  action: string;
 
  @Column({ name: 'old_value', type: 'json', nullable: true })
  oldValue: Record<string, any> | null;
 
  @Column({ name: 'new_value', type: 'json', nullable: true })
  newValue: Record<string, any> | null;
 
  @Column({ name: 'changed_by', length: 100, nullable: true })
  changedBy: string;
 
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
 