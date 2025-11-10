/**
 * Seed do banco de dados
 * Cria dados iniciais para desenvolvimento e testes
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Limpar dados existentes
  console.log('🗑️  Limpando dados existentes...');
  await prisma.indicacao.deleteMany();
  await prisma.membro.deleteMany();
  await prisma.intencao.deleteMany();
  await prisma.usuario.deleteMany();

  // ====================================================================
  // USUÁRIO ADMIN
  // ====================================================================
  console.log('👤 Criando usuário admin...');
  const senhaHashAdmin = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@networking.com',
      senhaHash: senhaHashAdmin,
      nome: 'Administrador',
      tipo: 'ADMIN',
      ativo: true,
    },
  });
  console.log(`✅ Admin criado: ${admin.email} / senha: admin123\n`);

  // ====================================================================
  // USUÁRIOS E MEMBROS
  // ====================================================================
  console.log('👥 Criando membros...');

  const membrosData = [
    {
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      telefone: '(11) 91234-5678',
      empresa: 'Tech Solutions',
      cargo: 'CEO',
      areaAtuacao: 'Tecnologia',
    },
    {
      nome: 'Maria Santos',
      email: 'maria@exemplo.com',
      telefone: '(11) 98765-4321',
      empresa: 'Consultoria ABC',
      cargo: 'Diretora',
      areaAtuacao: 'Consultoria Empresarial',
    },
    {
      nome: 'Pedro Costa',
      email: 'pedro@exemplo.com',
      telefone: '(11) 99999-8888',
      empresa: 'Marketing Pro',
      cargo: 'Gestor',
      areaAtuacao: 'Marketing Digital',
    },
  ];

  const membros = [];

  for (const membroData of membrosData) {
    const senhaHash = await bcrypt.hash('senha123', 10);

    const usuario = await prisma.usuario.create({
      data: {
        email: membroData.email,
        senhaHash,
        nome: membroData.nome,
        tipo: 'MEMBRO',
        ativo: true,
      },
    });

    const membro = await prisma.membro.create({
      data: {
        usuarioId: usuario.id,
        nomeCompleto: membroData.nome,
        email: membroData.email,
        telefone: membroData.telefone,
        empresa: membroData.empresa,
        cargo: membroData.cargo,
        areaAtuacao: membroData.areaAtuacao,
        status: 'ATIVO',
        dataEntrada: new Date(),
      },
    });

    membros.push(membro);
    console.log(`✅ Membro criado: ${membro.nomeCompleto}`);
  }

  console.log('');

  // ====================================================================
  // INTENÇÕES
  // ====================================================================
  console.log('📝 Criando intenções...');

  const intencoesData = [
    {
      nome: 'Ana Costa',
      email: 'ana@exemplo.com',
      telefone: '(11) 97777-6666',
      empresa: 'Design Studio',
      cargo: 'Designer',
      areaAtuacao: 'Design Gráfico',
      mensagem: 'Gostaria de fazer parte da rede de networking',
      status: 'PENDENTE' as const,
    },
    {
      nome: 'Carlos Mendes',
      email: 'carlos@exemplo.com',
      telefone: '(11) 96666-5555',
      empresa: 'Advocacia Mendes',
      cargo: 'Advogado',
      areaAtuacao: 'Direito Empresarial',
      mensagem: 'Tenho interesse em participar do grupo',
      status: 'PENDENTE' as const,
    },
    {
      nome: 'Julia Oliveira',
      email: 'julia@exemplo.com',
      telefone: '(11) 95555-4444',
      empresa: 'Contabilidade JO',
      cargo: 'Contadora',
      areaAtuacao: 'Contabilidade',
      mensagem: 'Quero contribuir com o networking',
      status: 'APROVADO' as const,
      tokenConvite: '550e8400-e29b-41d4-a716-446655440000',
    },
  ];

  for (const intencaoData of intencoesData) {
    await prisma.intencao.create({
      data: intencaoData,
    });
    console.log(`✅ Intenção criada: ${intencaoData.nome} (${intencaoData.status})`);
  }

  console.log('');

  // ====================================================================
  // INDICAÇÕES
  // ====================================================================
  console.log('🤝 Criando indicações...');

  const indicacoesData = [
    {
      membroIndicadorId: membros[0].id,
      membroIndicadoId: membros[1].id,
      titulo: 'Consultoria para empresa XYZ',
      descricao: 'Cliente precisa de consultoria empresarial urgente',
      cliente: 'Empresa XYZ Ltda',
      contatoCliente: 'contato@xyz.com',
      valorEstimado: 50000,
      status: 'EM_ANDAMENTO' as const,
    },
    {
      membroIndicadorId: membros[1].id,
      membroIndicadoId: membros[2].id,
      titulo: 'Marketing Digital para startup',
      descricao: 'Startup precisa de estratégia de marketing',
      cliente: 'StartupTech',
      contatoCliente: 'ceo@startuptech.com',
      valorEstimado: 30000,
      status: 'ABERTA' as const,
    },
    {
      membroIndicadorId: membros[0].id,
      membroIndicadoId: membros[2].id,
      titulo: 'Desenvolvimento de site',
      descricao: 'Cliente precisa de novo site institucional',
      cliente: 'Loja ABC',
      contatoCliente: 'contato@lojaabc.com',
      valorEstimado: 15000,
      status: 'FECHADA' as const,
      valorFechado: 14500,
      dataFechamento: new Date(),
    },
  ];

  for (const indicacaoData of indicacoesData) {
    await prisma.indicacao.create({
      data: indicacaoData,
    });
    console.log(`✅ Indicação criada: ${indicacaoData.titulo}`);
  }

  console.log('\n✅ Seed concluído com sucesso!\n');

  console.log('📊 Resumo dos dados criados:');
  console.log('----------------------------');
  console.log(`👤 Usuários: ${await prisma.usuario.count()}`);
  console.log(`👥 Membros: ${await prisma.membro.count()}`);
  console.log(`📝 Intenções: ${await prisma.intencao.count()}`);
  console.log(`🤝 Indicações: ${await prisma.indicacao.count()}`);
  console.log('');
  console.log('🔑 Credenciais de acesso:');
  console.log('----------------------------');
  console.log('Admin: admin@networking.com / admin123');
  console.log('Membro: joao@exemplo.com / senha123');
  console.log('Token convite Julia: 550e8400-e29b-41d4-a716-446655440000');
  console.log('');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


