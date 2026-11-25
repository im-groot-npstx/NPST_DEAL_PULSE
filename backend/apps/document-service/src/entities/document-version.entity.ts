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

@Entity('document_versions')
@Unique('UQ_document_versions_document_version', ['documentId', 'versionNumber'])
@Index(['documentId'])
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  documentId!: string;

  @ManyToOne(() => Document, (document) => document.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document!: Document;

  @Column({ type: 'int' })
  versionNumber!: number;

  @Column({ unique: true, length: 500 })
  storageKey!: string;

  @Column({ length: 255 })
  originalName!: string;

  @Column({ length: 100 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column({ length: 64 })
  checksumSha256!: string;

  @Column({ length: 20, default: 'CLEAN' })
  scanStatus!: string;

  @CreateDateColumn()
  createdAt!: Date;
}