-- Gerado por scripts/gerar-seed-sql.js. Não edite à mão: altere src/data/seed.js.
-- Rode no SQL Editor do Supabase depois do schema.sql. Pode rodar de novo.

insert into public.places (id, categoria, nome, descricao, endereco, telefone, latitude, longitude, data_inicio, data_fim, gratuito, tipo_org, formas_apoio, horario, necessidades) values
  ('0b6c3f5e-1a01-4c11-9a01-000000000001', 'clinica', 'Clínica Vet Popular 24h', 'Atendimento clínico e emergência 24 horas, com valores populares.', 'Setor Central, Gama - DF', '(61) 3000-0001', -16.0175, -48.0627, null, null, false, null, null, null, null),
  ('0b6c3f5e-1a01-4c11-9a01-000000000002', 'clinica', 'Hospital Vet Saúde', 'Consultas, cirurgias, exames de imagem e internação.', 'Taguatinga Norte, Taguatinga - DF', '(61) 3000-0002', -15.8243, -48.0588, null, null, false, null, null, null, null),
  ('0b6c3f5e-1a01-4c11-9a01-000000000003', 'clinica', 'Centro de Diagnóstico Animal', 'Exames laboratoriais, raio-x e ultrassom com resultado no mesmo dia.', 'Asa Sul, Brasília - DF', '(61) 3000-0003', -15.8156, -47.9027, null, null, false, null, null, null, null),
  ('0b6c3f5e-1a01-4c11-9a01-000000000004', 'vacinacao', 'Campanha de vacinação antirrábica', 'Vacina antirrábica gratuita para cães e gatos a partir de 3 meses. Leve um documento com foto. Gatos devem ir em caixa de transporte e cães com guia e coleira.', 'Praça do Cine, Setor Leste, Gama - DF', null, -16.0128, -48.0565, '2026-11-21', '2026-11-22', true, null, null, null, null),
  ('0b6c3f5e-1a01-4c11-9a01-000000000005', 'vacinacao', 'Vacinação no posto de Santa Maria', 'Ponto fixo de vacinação antirrábica para cães e gatos, de segunda a sexta.', 'Quadra Central, Santa Maria - DF', null, -16.0098, -48.0121, '2026-11-01', '2026-12-19', true, null, null, null, null),
  ('0b6c3f5e-1a01-4c11-9a01-000000000006', 'castracao', 'Mutirão de castração', 'Castração gratuita de cães e gatos com agendamento prévio. Vagas limitadas por dia. O animal precisa estar em jejum conforme orientação passada no agendamento.', 'Ceilândia Centro, Ceilândia - DF', '(61) 3000-0006', -15.8197, -48.1078, '2026-11-28', '2026-12-05', true, null, null, null, null),
  ('0b6c3f5e-1a01-4c11-9a01-000000000007', 'castracao', 'Castramóvel no Gama', 'Unidade móvel de castração. Inscrições presenciais no primeiro dia, a partir das 8h.', 'Setor Sul, Gama - DF', null, -16.0259, -48.0682, '2026-12-07', '2026-12-11', true, null, null, null, null),
  ('0b6c3f5e-1a01-4c11-9a01-000000000008', 'adocao', 'Feira de adoção de fim de ano', 'Cães e gatos vacinados e castrados esperando um lar. A adoção passa por entrevista e assinatura de termo de responsabilidade.', 'Parque da Cidade, Brasília - DF', null, -15.8001, -47.9083, '2026-12-13', '2026-12-13', true, null, null, null, null),
  ('0b6c3f5e-1a01-4c11-9a01-000000000009', 'ong', 'Abrigo Patas Unidas', 'ONG que resgata animais em situação de risco. Recebe doações de ração, voluntários e faz adoções aos sábados.', 'Ponte Alta, Gama - DF', '(61) 3000-0009', -15.9925, -48.0861, null, null, true, 'ong', array['doacao', 'voluntariado', 'adocao']::text[], 'Adoções aos sábados, das 9h às 13h', 'Ração para filhotes, cobertores e antipulgas.'),
  ('0b6c3f5e-1a01-4c11-9a01-000000000010', 'ong', 'Projeto Lar Animal', 'Protetores independentes que fazem lar temporário e acompanham adoções.', 'Taguatinga Sul, Taguatinga - DF', '(61) 3000-0010', -15.8452, -48.0441, null, null, true, 'protetor', array['lar_temporario', 'adocao', 'doacao']::text[], 'Atendimento por telefone, de segunda a sexta', 'Lares temporários para gatos filhotes e transporte para consultas.'),
  ('0b6c3f5e-1a01-4c11-9a01-000000000011', 'ong', 'Instituto Focinho Amigo', 'Resgata cães de rua, cuida da recuperação e encaminha para adoção. Mantém um programa de castração solidária para famílias de baixa renda.', 'Quadra 300, Santa Maria - DF', '(61) 3000-0011', -16.0152, -48.0189, null, null, true, 'ong', array['doacao', 'voluntariado', 'apadrinhamento', 'adocao']::text[], 'Visitas de terça a domingo, das 10h às 16h', 'Voluntários para passeios aos fins de semana e ração para cães adultos.'),
  ('0b6c3f5e-1a01-4c11-9a01-000000000012', 'ong', 'Rede Gatinhos do Gama', 'Grupo de protetoras que resgata gatos abandonados, faz castração e procura lares responsáveis.', 'Setor Oeste, Gama - DF', '(61) 3000-0012', -16.0216, -48.0793, null, null, true, 'protetor', array['lar_temporario', 'doacao', 'adocao']::text[], 'Feira de adoção no último domingo do mês', 'Areia higiênica, sachês e caixas de transporte.'),
  ('0b6c3f5e-1a01-4c11-9a01-000000000013', 'ong', 'Associação Quatro Patas do Recanto', 'Abrigo comunitário com cerca de 80 animais. Promove mutirões de vacinação e palestras sobre guarda responsável nas escolas.', 'Quadra 104, Recanto das Emas - DF', '(61) 3000-0013', -15.9101, -48.0612, null, null, true, 'ong', array['voluntariado', 'apadrinhamento', 'doacao', 'adocao']::text[], 'Segunda a sábado, das 8h às 17h', 'Material de limpeza, jornal e medicamentos vermífugos.'),
  ('0b6c3f5e-1a01-4c11-9a01-000000000014', 'ong', 'Projeto Cão Feliz', 'Protetor independente que acolhe cães idosos e com deficiência e busca adotantes para eles.', 'Samambaia Norte, Samambaia - DF', '(61) 3000-0014', -15.8712, -48.0901, null, null, true, 'protetor', array['apadrinhamento', 'lar_temporario', 'adocao']::text[], 'Visitas com agendamento por telefone', 'Fraldas para cães, ração sênior e padrinhos para custear remédios.')
on conflict (id) do update set categoria = excluded.categoria, nome = excluded.nome, descricao = excluded.descricao, endereco = excluded.endereco, telefone = excluded.telefone, latitude = excluded.latitude, longitude = excluded.longitude, data_inicio = excluded.data_inicio, data_fim = excluded.data_fim, gratuito = excluded.gratuito, tipo_org = excluded.tipo_org, formas_apoio = excluded.formas_apoio, horario = excluded.horario, necessidades = excluded.necessidades;

insert into public.guides (id, ordem, tema, titulo, resumo, conteudo) values
  ('7d1e2a40-2b02-4d22-8b02-000000000001', 1, 'Vacinação', 'Por que manter as vacinas em dia', 'Quais vacinas existem e por que o reforço anual importa.', 'A vacinação protege o animal de doenças graves e, no caso da raiva, protege também as pessoas da casa.

Cães costumam receber a vacina polivalente (V8 ou V10), que protege contra cinomose, parvovirose, leptospirose e outras doenças. Gatos recebem a polivalente felina (V3, V4 ou V5).

A antirrábica é obrigatória para cães e gatos e precisa de reforço anual. Ela é oferecida de graça nas campanhas públicas.

Filhotes precisam de um esquema com várias doses. O veterinário define as datas de acordo com a idade e a saúde do animal.

Registre cada dose na carteirinha do app para receber o lembrete da próxima.'),
  ('7d1e2a40-2b02-4d22-8b02-000000000002', 2, 'Castração', 'Castração: benefícios e cuidados', 'Como a castração ajuda o pet e reduz o abandono.', 'A castração evita ninhadas indesejadas, que são uma das principais causas de abandono de animais.

Ela também reduz o risco de alguns tipos de câncer e infecções no útero, diminui fugas no período de cio e costuma deixar o animal mais tranquilo.

Antes da cirurgia o veterinário pede jejum e, em alguns casos, exames. Depois, o animal precisa de repouso, roupa cirúrgica ou colar e acompanhamento dos pontos.

Procure os mutirões de castração gratuitos na aba Serviços.'),
  ('7d1e2a40-2b02-4d22-8b02-000000000003', 3, 'Alimentação', 'Alimentação adequada', 'O que oferecer e quais alimentos evitar.', 'Ofereça ração de boa qualidade, adequada à espécie, à idade e ao porte do animal, nas quantidades indicadas na embalagem ou pelo veterinário.

Água fresca e limpa deve estar sempre disponível. Troque a água pelo menos uma vez por dia.

Alguns alimentos comuns são tóxicos para cães e gatos: chocolate, uva e uva-passa, cebola, alho, abacate e produtos com xilitol. Evite também ossos cozidos, que podem lascar.

Mudanças de ração devem ser feitas aos poucos, misturando a nova com a antiga ao longo de alguns dias.'),
  ('7d1e2a40-2b02-4d22-8b02-000000000004', 4, 'Higiene', 'Higiene e prevenção de parasitas', 'Banho, escovação, vermífugo e antipulgas.', 'A frequência do banho depende da pelagem e da rotina do animal. Banhos em excesso podem ressecar a pele.

Escovar os pelos ajuda a evitar nós e a perceber feridas, carrapatos ou caroços.

Vermífugo e antipulgas devem ser dados com a frequência indicada pelo veterinário. Registre como medicamento na carteirinha para não esquecer.

Mantenha limpos o local onde o animal dorme, os potes de comida e a caixa de areia.'),
  ('7d1e2a40-2b02-4d22-8b02-000000000005', 5, 'Guarda responsável', 'Guarda responsável', 'Os deveres de quem tem um animal de estimação.', 'Ter um animal é um compromisso de muitos anos. Ele depende do tutor para alimentação, abrigo, saúde e companhia.

Use coleira com identificação e mantenha o animal dentro de casa ou em área segura. Passeios devem ser feitos com guia.

Abandonar ou maltratar animais é crime no Brasil.

Mantenha vacinas, vermífugos e consultas em dia, e procure o veterinário sempre que notar algo diferente.'),
  ('7d1e2a40-2b02-4d22-8b02-000000000006', 6, 'Adoção', 'Antes de adotar', 'Perguntas para fazer antes de trazer um pet para casa.', 'Antes de adotar, pense no espaço que você tem, no tempo disponível para passeios e brincadeiras e nos custos com ração, vacinas e veterinário.

Converse com todos da casa. Todos precisam estar de acordo.

Animais adultos também são ótimas companhias e já têm porte e temperamento conhecidos.

Veja as feiras de adoção e as ONGs na aba Serviços.'),
  ('7d1e2a40-2b02-4d22-8b02-000000000007', 7, 'Sinais de alerta', 'Quando procurar o veterinário com urgência', 'Sintomas que não devem esperar.', 'Procure atendimento o quanto antes se o animal apresentar: dificuldade para respirar, vômito ou diarreia que não param, sangramento, convulsão, barriga inchada e dura, fraqueza intensa ou se ele parar de comer e beber.

Em caso de suspeita de envenenamento, não provoque vômito por conta própria. Leve o animal ao veterinário e, se possível, a embalagem do produto.

As clínicas 24h aparecem na aba Serviços, ordenadas pela distância.')
on conflict (id) do update set ordem = excluded.ordem, tema = excluded.tema, titulo = excluded.titulo, resumo = excluded.resumo, conteudo = excluded.conteudo;
