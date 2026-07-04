// JS/model.js
// Camada MODEL: conexão com Supabase e operações no banco.
// As credenciais ficam no arquivo JS/config.js, que deve ficar fora do Git.

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('COLE_') || SUPABASE_KEY.includes('COLE_')) {
    throw new Error("Configure o Supabase em JS/config.js antes de executar o projeto.");
}

if (!window.supabase) {
    throw new Error("Biblioteca do Supabase não foi carregada. Confira o script CDN no HTML.");
}

export const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

export async function loginUsuario(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function buscarPerfilPorId(userId) {
    const { data, error } = await db
        .from('perfis')
        .select('nome, cargo')
        .eq('id', userId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function buscarVendedores() {
    const { data, error } = await db
        .from('perfis')
        .select('id, nome, cargo')
        .eq('cargo', 'vendedor')
        .order('nome');

    if (error) throw error;
    return data || [];
}

export async function buscarProdutos() {
    const { data, error } = await db
        .from('produtos')
        .select('*')
        .order('nome');

    if (error) throw error;
    return data || [];
}

export async function cadastrarProduto(produto) {
    const { error } = await db.from('produtos').insert([produto]);
    if (error) throw error;
}

export async function atualizarProduto(produtoId, produto) {
    const { error } = await db
        .from('produtos')
        .update(produto)
        .eq('id', produtoId);

    if (error) throw error;
}

export async function deletarProduto(produtoId) {
    const { error } = await db
        .from('produtos')
        .delete()
        .eq('id', produtoId);

    if (error) throw error;
}

export async function inserirVenda(venda) {
    const { error } = await db.from('vendas').insert([venda]);
    if (error) throw error;
}

export async function buscarVendasHistorico({ vendedorId = '', mes = '' } = {}) {
    let query = db
        .from('vendas')
        .select('id, vendedor_id, produto_id, valor_venda, comissao_gerada, data_venda')
        .order('data_venda', { ascending: false })
        .limit(500);

    if (vendedorId) query = query.eq('vendedor_id', vendedorId);

    if (mes) {
        const [ano, mesNumero] = mes.split('-');
        const inicio = `${ano}-${mesNumero}-01`;
        const fim = new Date(Number(ano), Number(mesNumero), 0).toISOString().slice(0, 10);
        query = query.gte('data_venda', inicio).lte('data_venda', fim);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function atualizarVenda(vendaId, venda) {
    const { error } = await db
        .from('vendas')
        .update(venda)
        .eq('id', vendaId);

    if (error) throw error;
}

export async function deletarVenda(vendaId) {
    const { error } = await db
        .from('vendas')
        .delete()
        .eq('id', vendaId);

    if (error) throw error;
}

export async function inserirMeta(meta) {
    const { error } = await db.from('metas').insert([meta]);
    if (error) throw error;
}

export async function buscarMetasHistorico({ vendedorId = '', mes = '' } = {}) {
    let query = db
        .from('metas')
        .select('id, vendedor_id, mes_ano, valor_meta')
        .order('mes_ano', { ascending: false })
        .limit(500);

    if (vendedorId) query = query.eq('vendedor_id', vendedorId);

    if (mes) {
        const [ano, mesNumero] = mes.split('-');
        query = query.eq('mes_ano', `${mesNumero}/${ano}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function atualizarMeta(metaId, meta) {
    const { error } = await db
        .from('metas')
        .update(meta)
        .eq('id', metaId);

    if (error) throw error;
}

export async function deletarMeta(metaId) {
    const { error } = await db
        .from('metas')
        .delete()
        .eq('id', metaId);

    if (error) throw error;
}

export async function buscarVendasGestor(filtros = {}) {
    let query = db
        .from('vendas')
        .select('valor_venda, comissao_gerada, data_venda, perfis:vendedor_id(nome), produtos:produto_id(nome)')
        .order('data_venda', { ascending: false });

    if (filtros.vendedorId && filtros.vendedorId !== 'todos') query = query.eq('vendedor_id', filtros.vendedorId);
    if (filtros.produtoId && filtros.produtoId !== 'todos') query = query.eq('produto_id', filtros.produtoId);
    if (filtros.dataInicio) query = query.gte('data_venda', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data_venda', filtros.dataFim);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function buscarVendasVendedor(vendedorId, inicio = null, fim = null) {
    let query = db
        .from('vendas')
        .select('data_venda, valor_venda, comissao_gerada, produtos:produto_id(nome)')
        .eq('vendedor_id', vendedorId)
        .order('data_venda', { ascending: false });

    if (inicio && fim) query = query.gte('data_venda', inicio).lte('data_venda', fim);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function buscarMetaVendedor(vendedorId, mesAno) {
    const { data, error } = await db
        .from('metas')
        .select('valor_meta')
        .eq('vendedor_id', vendedorId)
        .eq('mes_ano', mesAno)
        .maybeSingle();

    if (error) throw error;
    return data;
}
