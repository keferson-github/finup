import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AccountType } from '../../common/enums/transaction.enum';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  nome: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.CONTA_CORRENTE,
  })
  tipo: AccountType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldo: number;

  @Column({ name: 'saldo_inicial', type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoInicial: number;

  @Column({ default: '#3B82F6' })
  cor: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  // Relations
  @ManyToOne(() => User, user => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.account)
  transactions: Transaction[];
}