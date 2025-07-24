import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('profiles')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'nome_completo', nullable: true })
  nomeCompleto: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ default: 'BRL' })
  moeda: string;

  @Column({ name: 'fuso_horario', default: 'America/Sao_Paulo' })
  fusoHorario: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  // Relations
  @OneToMany(() => Account, account => account.user)
  accounts: Account[];

  @OneToMany(() => Category, category => category.user)
  categories: Category[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];
}