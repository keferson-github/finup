import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { TransactionType, TransactionStatus, RecurrenceFrequency } from '../../common/enums/transaction.enum';
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

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
    enum: TransactionStatus,
    default: TransactionStatus.PAGO,
  })
  status: TransactionStatus;

  @Column({ type: 'date' })
  data: Date;

  @Column({ name: 'data_vencimento', type: 'date', nullable: true })
  dataVencimento: Date;

  // Parcelamento
  @Column({ name: 'eh_parcelamento', default: false })
  ehParcelamento: boolean;

  @Column({ name: 'numero_parcela', default: 1 })
  numeroParcela: number;

  @Column({ name: 'total_parcelas', default: 1 })
  totalParcelas: number;

  @Column({ name: 'transacao_pai_id', nullable: true })
  transacaoPaiId: string;

  // Recorrência
  @Column({ name: 'eh_recorrente', default: false })
  ehRecorrente: boolean;

  @Column({
    name: 'frequencia_recorrencia',
    type: 'enum',
    enum: RecurrenceFrequency,
    nullable: true,
  })
  frequenciaRecorrencia: RecurrenceFrequency;

  @Column({ name: 'data_fim_recorrencia', type: 'date', nullable: true })
  dataFimRecorrencia: Date;

  @Column({ name: 'template_recorrencia_id', nullable: true })
  templateRecorrenciaId: string;

  // Metadados
  @Column({ type: 'json', default: () => "'[]'" })
  tags: string[];

  @Column({ nullable: true })
  observacoes: string;

  @Column({ name: 'url_anexo', nullable: true })
  urlAnexo: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  // Relations
  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Account, account => account.transactions)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Category, category => category.transactions)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @BeforeInsert()
  @BeforeUpdate()
  updateStatus() {
    if (this.status === TransactionStatus.PAGO) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const transactionDate = new Date(this.data);
    transactionDate.setHours(0, 0, 0, 0);

    if (transactionDate < today) {
      this.status = TransactionStatus.VENCIDO;
    } else {
      this.status = TransactionStatus.PENDENTE;
    }
  }
}