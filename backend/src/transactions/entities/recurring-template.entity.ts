import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TransactionType, RecurrenceFrequency } from '../../common/enums/transaction.enum';
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('recurring_templates')
export class RecurringTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  nome: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  tipo: TransactionType;

  @Column({
    type: 'enum',
    enum: RecurrenceFrequency,
  })
  frequencia: RecurrenceFrequency;

  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'date', nullable: true })
  dataFim: Date;

  @Column({ name: 'proxima_execucao', type: 'date' })
  proximaExecucao: Date;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}