import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DocumentAttachment } from './document-attachment.entity';
import { DocumentVersion } from './document-version.entity';

@Entity('documents')
@Index(['leadId'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  originalName!: string;

  /** Denormalized current-version storage key (backward compatibility). */
  @Column({ unique: true, length: 500 })
  storageKey!: string;

  @Column({ length: 100 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column({ length: 20, default: 'CLEAN' })
  scanStatus!: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  uploadedBy!: string | null;

  /** Legacy field; prefer document_attachments for new integrations. */
  @Column({ type: 'varchar', nullable: true, length: 100 })
  leadId!: string | null;

  @Column({ type: 'int', default: 1 })
  currentVersionNumber!: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksumSha256!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions!: DocumentVersion[];

  @OneToMany(() => DocumentAttachment, (attachment) => attachment.document)
  attachments!: DocumentAttachment[];
}