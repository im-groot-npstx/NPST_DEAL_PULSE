import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Document } from './document.entity';

@Entity('document_attachments')
@Unique('UQ_document_attachments_link', [
  'documentId',
  'entityType',
  'entityId',
  'relationshipType',
])
@Index(['entityType', 'entityId'])
@Index(['documentId'])
export class DocumentAttachment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  documentId!: string;

  @ManyToOne(() => Document, (document) => document.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document!: Document;

  @Column({ length: 50 })
  entityType!: string;

  @Column({ length: 100 })
  entityId!: string;

  @Column({ length: 50, default: 'ATTACHMENT' })
  relationshipType!: string;

  @CreateDateColumn()
  createdAt!: Date;
}