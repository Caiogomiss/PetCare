// Dados iniciais de serviços, campanhas e orientações.
// São usados no modo local e também viram os INSERTs do supabase.sql
// (rode `node scripts/gerar-seed-sql.js` depois de alterar este arquivo).
// Os locais abaixo são exemplos para demonstração: troque pelos reais quando tiver.

const PLACES = [
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000001',
    categoria: 'clinica',
    nome: 'Clínica Vet Popular 24h',
    descricao: 'Atendimento clínico e emergência 24 horas, com valores populares.',
    endereco: 'Setor Central, Gama - DF',
    telefone: '(61) 3000-0001',
    latitude: -16.0175,
    longitude: -48.0627,
    data_inicio: null,
    data_fim: null,
    gratuito: false,
  },
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000002',
    categoria: 'clinica',
    nome: 'Hospital Vet Saúde',
    descricao: 'Consultas, cirurgias, exames de imagem e internação.',
    endereco: 'Taguatinga Norte, Taguatinga - DF',
    telefone: '(61) 3000-0002',
    latitude: -15.8243,
    longitude: -48.0588,
    data_inicio: null,
    data_fim: null,
    gratuito: false,
  },
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000003',
    categoria: 'clinica',
    nome: 'Centro de Diagnóstico Animal',
    descricao: 'Exames laboratoriais, raio-x e ultrassom com resultado no mesmo dia.',
    endereco: 'Asa Sul, Brasília - DF',
    telefone: '(61) 3000-0003',
    latitude: -15.8156,
    longitude: -47.9027,
    data_inicio: null,
    data_fim: null,
    gratuito: false,
  },
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000004',
    categoria: 'vacinacao',
    nome: 'Campanha de vacinação antirrábica',
    descricao: 'Vacina antirrábica gratuita para cães e gatos a partir de 3 meses. Leve um documento com foto. Gatos devem ir em caixa de transporte e cães com guia e coleira.',
    endereco: 'Praça do Cine, Setor Leste, Gama - DF',
    telefone: null,
    latitude: -16.0128,
    longitude: -48.0565,
    data_inicio: '2026-11-21',
    data_fim: '2026-11-22',
    gratuito: true,
  },
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000005',
    categoria: 'vacinacao',
    nome: 'Vacinação no posto de Santa Maria',
    descricao: 'Ponto fixo de vacinação antirrábica para cães e gatos, de segunda a sexta.',
    endereco: 'Quadra Central, Santa Maria - DF',
    telefone: null,
    latitude: -16.0098,
    longitude: -48.0121,
    data_inicio: '2026-11-01',
    data_fim: '2026-12-19',
    gratuito: true,
  },
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000006',
    categoria: 'castracao',
    nome: 'Mutirão de castração',
    descricao: 'Castração gratuita de cães e gatos com agendamento prévio. Vagas limitadas por dia. O animal precisa estar em jejum conforme orientação passada no agendamento.',
    endereco: 'Ceilândia Centro, Ceilândia - DF',
    telefone: '(61) 3000-0006',
    latitude: -15.8197,
    longitude: -48.1078,
    data_inicio: '2026-11-28',
    data_fim: '2026-12-05',
    gratuito: true,
  },
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000007',
    categoria: 'castracao',
    nome: 'Castramóvel no Gama',
    descricao: 'Unidade móvel de castração. Inscrições presenciais no primeiro dia, a partir das 8h.',
    endereco: 'Setor Sul, Gama - DF',
    telefone: null,
    latitude: -16.0259,
    longitude: -48.0682,
    data_inicio: '2026-12-07',
    data_fim: '2026-12-11',
    gratuito: true,
  },
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000008',
    categoria: 'adocao',
    nome: 'Feira de adoção de fim de ano',
    descricao: 'Cães e gatos vacinados e castrados esperando um lar. A adoção passa por entrevista e assinatura de termo de responsabilidade.',
    endereco: 'Parque da Cidade, Brasília - DF',
    telefone: null,
    latitude: -15.8001,
    longitude: -47.9083,
    data_inicio: '2026-12-13',
    data_fim: '2026-12-13',
    gratuito: true,
  },
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000009',
    categoria: 'ong',
    nome: 'Abrigo Patas Unidas',
    descricao: 'ONG que resgata animais em situação de risco. Recebe doações de ração, voluntários e faz adoções aos sábados.',
    endereco: 'Ponte Alta, Gama - DF',
    telefone: '(61) 3000-0009',
    latitude: -15.9925,
    longitude: -48.0861,
    data_inicio: null,
    data_fim: null,
    gratuito: true,
  },
  {
    id: '0b6c3f5e-1a01-4c11-9a01-000000000010',
    categoria: 'ong',
    nome: 'Projeto Lar Animal',
    descricao: 'Protetores independentes que fazem lar temporário e acompanham adoções.',
    endereco: 'Taguatinga Sul, Taguatinga - DF',
    telefone: '(61) 3000-0010',
    latitude: -15.8452,
    longitude: -48.0441,
    data_inicio: null,
    data_fim: null,
    gratuito: true,
  },
]

const GUIDES = [
  {
    id: '7d1e2a40-2b02-4d22-8b02-000000000001',
    ordem: 1,
    tema: 'Vacinação',
    titulo: 'Por que manter as vacinas em dia',
    resumo: 'Quais vacinas existem e por que o reforço anual importa.',
    conteudo:
      'A vacinação protege o animal de doenças graves e, no caso da raiva, protege também as pessoas da casa.\n\n' +
      'Cães costumam receber a vacina polivalente (V8 ou V10), que protege contra cinomose, parvovirose, leptospirose e outras doenças. Gatos recebem a polivalente felina (V3, V4 ou V5).\n\n' +
      'A antirrábica é obrigatória para cães e gatos e precisa de reforço anual. Ela é oferecida de graça nas campanhas públicas.\n\n' +
      'Filhotes precisam de um esquema com várias doses. O veterinário define as datas de acordo com a idade e a saúde do animal.\n\n' +
      'Registre cada dose na carteirinha do app para receber o lembrete da próxima.',
  },
  {
    id: '7d1e2a40-2b02-4d22-8b02-000000000002',
    ordem: 2,
    tema: 'Castração',
    titulo: 'Castração: benefícios e cuidados',
    resumo: 'Como a castração ajuda o pet e reduz o abandono.',
    conteudo:
      'A castração evita ninhadas indesejadas, que são uma das principais causas de abandono de animais.\n\n' +
      'Ela também reduz o risco de alguns tipos de câncer e infecções no útero, diminui fugas no período de cio e costuma deixar o animal mais tranquilo.\n\n' +
      'Antes da cirurgia o veterinário pede jejum e, em alguns casos, exames. Depois, o animal precisa de repouso, roupa cirúrgica ou colar e acompanhamento dos pontos.\n\n' +
      'Procure os mutirões de castração gratuitos na aba Serviços.',
  },
  {
    id: '7d1e2a40-2b02-4d22-8b02-000000000003',
    ordem: 3,
    tema: 'Alimentação',
    titulo: 'Alimentação adequada',
    resumo: 'O que oferecer e quais alimentos evitar.',
    conteudo:
      'Ofereça ração de boa qualidade, adequada à espécie, à idade e ao porte do animal, nas quantidades indicadas na embalagem ou pelo veterinário.\n\n' +
      'Água fresca e limpa deve estar sempre disponível. Troque a água pelo menos uma vez por dia.\n\n' +
      'Alguns alimentos comuns são tóxicos para cães e gatos: chocolate, uva e uva-passa, cebola, alho, abacate e produtos com xilitol. Evite também ossos cozidos, que podem lascar.\n\n' +
      'Mudanças de ração devem ser feitas aos poucos, misturando a nova com a antiga ao longo de alguns dias.',
  },
  {
    id: '7d1e2a40-2b02-4d22-8b02-000000000004',
    ordem: 4,
    tema: 'Higiene',
    titulo: 'Higiene e prevenção de parasitas',
    resumo: 'Banho, escovação, vermífugo e antipulgas.',
    conteudo:
      'A frequência do banho depende da pelagem e da rotina do animal. Banhos em excesso podem ressecar a pele.\n\n' +
      'Escovar os pelos ajuda a evitar nós e a perceber feridas, carrapatos ou caroços.\n\n' +
      'Vermífugo e antipulgas devem ser dados com a frequência indicada pelo veterinário. Registre como medicamento na carteirinha para não esquecer.\n\n' +
      'Mantenha limpos o local onde o animal dorme, os potes de comida e a caixa de areia.',
  },
  {
    id: '7d1e2a40-2b02-4d22-8b02-000000000005',
    ordem: 5,
    tema: 'Guarda responsável',
    titulo: 'Guarda responsável',
    resumo: 'Os deveres de quem tem um animal de estimação.',
    conteudo:
      'Ter um animal é um compromisso de muitos anos. Ele depende do tutor para alimentação, abrigo, saúde e companhia.\n\n' +
      'Use coleira com identificação e mantenha o animal dentro de casa ou em área segura. Passeios devem ser feitos com guia.\n\n' +
      'Abandonar ou maltratar animais é crime no Brasil.\n\n' +
      'Mantenha vacinas, vermífugos e consultas em dia, e procure o veterinário sempre que notar algo diferente.',
  },
  {
    id: '7d1e2a40-2b02-4d22-8b02-000000000006',
    ordem: 6,
    tema: 'Adoção',
    titulo: 'Antes de adotar',
    resumo: 'Perguntas para fazer antes de trazer um pet para casa.',
    conteudo:
      'Antes de adotar, pense no espaço que você tem, no tempo disponível para passeios e brincadeiras e nos custos com ração, vacinas e veterinário.\n\n' +
      'Converse com todos da casa. Todos precisam estar de acordo.\n\n' +
      'Animais adultos também são ótimas companhias e já têm porte e temperamento conhecidos.\n\n' +
      'Veja as feiras de adoção e as ONGs na aba Serviços.',
  },
  {
    id: '7d1e2a40-2b02-4d22-8b02-000000000007',
    ordem: 7,
    tema: 'Sinais de alerta',
    titulo: 'Quando procurar o veterinário com urgência',
    resumo: 'Sintomas que não devem esperar.',
    conteudo:
      'Procure atendimento o quanto antes se o animal apresentar: dificuldade para respirar, vômito ou diarreia que não param, sangramento, convulsão, barriga inchada e dura, fraqueza intensa ou se ele parar de comer e beber.\n\n' +
      'Em caso de suspeita de envenenamento, não provoque vômito por conta própria. Leve o animal ao veterinário e, se possível, a embalagem do produto.\n\n' +
      'As clínicas 24h aparecem na aba Serviços, ordenadas pela distância.',
  },
]

module.exports = { PLACES, GUIDES }
