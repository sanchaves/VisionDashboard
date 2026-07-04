// JS/controller.js
// Camada CONTROLLER: eventos da tela, fluxo da aplicação e ligação entre Model e View.

import {
    loginUsuario,
    buscarPerfilPorId,
    buscarVendedores,
    buscarProdutos,
    inserirVenda,
    inserirMeta,
    buscarMetasHistorico,
    atualizarMeta,
    deletarMeta,
    buscarVendasHistorico,
    atualizarVenda,
    deletarVenda,
    atualizarProduto,
    deletarProduto,
    cadastrarProduto,
    buscarVendasGestor,
    buscarVendasVendedor,
    buscarMetaVendedor
} from './model.js';

import {
    criarIcones,
    mostrarMensagem,
    confirmarAcao,
    setTexto,
    getValor,
    setValor,
    resetarFormulario,
    formatarMoeda,
    monthParaMesAnoBr,
    mesAnoAtualBr,
    protegerRota,
    sairSistema,
    obterDadosLogin,
    setBotaoLogin,
    redirecionarPorCargo,
    preencherSelect,
    selecionarTarefa,
    mostrarCarregandoTabela,
    mostrarCarregandoTabelaAnalista,
    renderizarHistoricoVendas,
    abrirBoxEdicaoVenda,
    fecharBoxEdicaoVenda,
    renderizarHistoricoMetas,
    abrirBoxEdicaoMeta,
    fecharBoxEdicaoMeta,
    renderizarTabelaProdutos,
    abrirBoxEdicaoProduto,
    fecharBoxEdicaoProduto,
    renderizarTabelaGestor,
    atualizarKpisGestor,
    renderizarTabelaVendedor,
    atualizarMetaVendedor
} from './view.js';

let listaProdutos = [];
let listaVendedores = [];
let listaVendasHistorico = [];
let listaMetasHistorico = [];
let chartRanking = null;
let chartProdutos = null;

document.addEventListener('DOMContentLoaded', () => {
    criarIcones();
    const pagina = detectarPaginaAtual();
    if (pagina === 'login') iniciarLogin();
    if (pagina === 'analista') iniciarAnalista();
    if (pagina === 'gestor') iniciarGestor();
    if (pagina === 'vendedor') iniciarVendedor();
});

function detectarPaginaAtual() {
    const caminho = window.location.pathname.toLowerCase();
    if (caminho.includes('analista.html')) return 'analista';
    if (caminho.includes('gestor.html')) return 'gestor';
    if (caminho.includes('vendedor.html')) return 'vendedor';
    return 'login';
}

// LOGIN
function iniciarLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setBotaoLogin(true);
        const { email, password } = obterDadosLogin();

        try {
            const authData = await loginUsuario(email, password);
            const perfil = await buscarPerfilPorId(authData.user.id);

            if (!perfil) {
                mostrarMensagem("Erro: este e-mail existe no Auth, mas não possui perfil/cargo na tabela 'perfis'.");
                setBotaoLogin(false);
                return;
            }

            localStorage.setItem('user_nome', perfil.nome);
            localStorage.setItem('user_cargo', perfil.cargo);
            localStorage.setItem('user_id', authData.user.id);
            redirecionarPorCargo(perfil.cargo);
        } catch (error) {
            mostrarMensagem('Falha técnica na autenticação:\n' + error.message);
            setBotaoLogin(false);
        }
    });
}

// ANALISTA
async function iniciarAnalista() {
    protegerRota('analista');
    setTexto('txtBoasVindas', `Olá, ${localStorage.getItem('user_nome') || 'Analista'}`);
    document.getElementById('btnSair')?.addEventListener('click', sairSistema);

    try {
        listaVendedores = await buscarVendedores();
        listaProdutos = await buscarProdutos();
        sincronizarSelectsAnalista();
        atualizarPreviewVenda();
        configurarEventosAnalista();
        renderizarTabelaProdutos(listaProdutos);
        criarIcones();
    } catch (error) {
        console.error('Erro ao inicializar tela do analista:', error);
        mostrarMensagem('Houve um problema ao sincronizar dados com o banco. Veja o console F12.');
    }
}

function sincronizarSelectsAnalista() {
    preencherSelect('vendedorSelect', listaVendedores, 'Selecione o vendedor...');
    preencherSelect('vendedorMetaSelect', listaVendedores, 'Selecione o vendedor...');
    preencherSelect('filtroVendedorHistorico', listaVendedores, 'Todos os vendedores');
    preencherSelect('editVendedorSelect', listaVendedores, 'Selecione o vendedor...');
    preencherSelect('filtroVendedorMetas', listaVendedores, 'Todos os vendedores');
    preencherSelect('editMetaVendedorSelect', listaVendedores, 'Selecione o vendedor...');

    preencherSelect('produtoSelect', listaProdutos, 'Selecione o produto...');
    preencherSelect('produtoComissaoSelect', listaProdutos, 'Selecione o produto...');
    preencherSelect('editProdutoSelect', listaProdutos, 'Selecione o produto...');
}

function configurarEventosAnalista() {
    document.querySelectorAll('.task-card[data-section]').forEach(botao => {
        botao.addEventListener('click', async () => {
            selecionarTarefa(botao.dataset.section, botao);
            if (botao.dataset.loadVendas === 'true') await carregarHistoricoAnalista();
            if (botao.dataset.loadMetas === 'true') await carregarMetasAnalista();
            if (botao.dataset.loadProdutos === 'true') await carregarProdutosAnalista();
        });
    });

    document.getElementById('produtoSelect')?.addEventListener('change', () => {
        const produto = obterProdutoPorId(getValor('produtoSelect'));
        if (produto && parseFloat(produto.valor_padrao || 0) > 0) setValor('inputValor', parseFloat(produto.valor_padrao).toFixed(2));
        atualizarPreviewVenda();
    });

    document.getElementById('inputValor')?.addEventListener('input', atualizarPreviewVenda);
    document.getElementById('editProdutoSelect')?.addEventListener('change', () => {
        const produto = obterProdutoPorId(getValor('editProdutoSelect'));
        if (produto && parseFloat(produto.valor_padrao || 0) > 0) setValor('editValorVenda', parseFloat(produto.valor_padrao).toFixed(2));
        atualizarPreviewEdicao();
    });
    document.getElementById('editValorVenda')?.addEventListener('input', atualizarPreviewEdicao);

    document.getElementById('formVenda')?.addEventListener('submit', salvarVendaAnalista);
    document.getElementById('formEditarVenda')?.addEventListener('submit', salvarEdicaoVendaAnalista);
    document.getElementById('btnBuscarVendas')?.addEventListener('click', carregarHistoricoAnalista);
    document.getElementById('btnLimparFiltrosHistorico')?.addEventListener('click', limparFiltrosHistoricoAnalista);
    document.getElementById('btnCancelarEdicaoVenda')?.addEventListener('click', fecharBoxEdicaoVenda);

    document.getElementById('tbodyVendas')?.addEventListener('click', async (event) => {
        const editar = event.target.closest('.btn-editar-venda');
        const excluir = event.target.closest('.btn-excluir-venda');
        if (editar) abrirEdicaoVendaAnalista(editar.dataset.id);
        if (excluir) await excluirVendaAnalista(excluir.dataset.id);
    });

    document.getElementById('formMeta')?.addEventListener('submit', salvarMetaAnalista);
    document.getElementById('formEditarMeta')?.addEventListener('submit', salvarEdicaoMetaAnalista);
    document.getElementById('btnBuscarMetas')?.addEventListener('click', carregarMetasAnalista);
    document.getElementById('btnLimparFiltrosMetas')?.addEventListener('click', limparFiltrosMetasAnalista);
    document.getElementById('btnCancelarEdicaoMeta')?.addEventListener('click', fecharBoxEdicaoMeta);

    document.getElementById('tbodyMetas')?.addEventListener('click', async (event) => {
        const editar = event.target.closest('.btn-editar-meta');
        const excluir = event.target.closest('.btn-excluir-meta');
        if (editar) abrirEdicaoMetaAnalista(editar.dataset.id);
        if (excluir) await excluirMetaAnalista(excluir.dataset.id);
    });

    document.getElementById('produtoComissaoSelect')?.addEventListener('change', carregarDadosProdutoComissao);
    document.getElementById('formProdutoComissao')?.addEventListener('submit', salvarRegraProdutoAnalista);
    document.getElementById('btnExcluirProdutoComissao')?.addEventListener('click', async () => {
        const produtoId = getValor('produtoComissaoSelect');
        if (produtoId) await excluirProdutoAnalista(produtoId);
    });

    document.getElementById('formNovoProduto')?.addEventListener('submit', salvarNovoProdutoAnalista);
    document.getElementById('formEditarProduto')?.addEventListener('submit', salvarEdicaoProdutoAnalista);
    document.getElementById('btnAtualizarProdutos')?.addEventListener('click', carregarProdutosAnalista);
    document.getElementById('btnCancelarEdicaoProduto')?.addEventListener('click', fecharBoxEdicaoProduto);

    document.getElementById('tbodyProdutos')?.addEventListener('click', async (event) => {
        const editar = event.target.closest('.btn-editar-produto');
        const excluir = event.target.closest('.btn-excluir-produto');
        if (editar) abrirEdicaoProdutoAnalista(editar.dataset.id);
        if (excluir) await excluirProdutoAnalista(excluir.dataset.id);
    });
}

function obterProdutoPorId(produtoId) {
    return listaProdutos.find(p => String(p.id) === String(produtoId));
}

function calcularComissao(produto, valorVenda) {
    if (!produto) return 0;
    const premiacaoFixa = parseFloat(produto.premiacao_fixa || 0);
    const percentual = parseFloat(produto.percentual_comissao || 0);
    const valor = parseFloat(valorVenda || 0);
    if (premiacaoFixa > 0) return premiacaoFixa;
    if (percentual > 0) return (valor * percentual) / 100;
    return 0;
}

function textoRegraComissao(produto, valorVenda) {
    if (!produto) return 'Selecione um produto para visualizar a regra de comissão.';
    const valor = parseFloat(valorVenda || 0);
    const comissao = calcularComissao(produto, valor);
    const premiacaoFixa = parseFloat(produto.premiacao_fixa || 0);
    const percentual = parseFloat(produto.percentual_comissao || 0);
    if (premiacaoFixa > 0) return `Regra: premiação fixa de ${formatarMoeda(premiacaoFixa)}. Comissão prevista: ${formatarMoeda(comissao)}.`;
    if (percentual > 0) return `Regra: ${percentual}% sobre o valor da venda. Comissão prevista: ${formatarMoeda(comissao)}.`;
    return 'Este produto ainda não possui regra de comissão cadastrada.';
}

function atualizarPreviewVenda() {
    const produto = obterProdutoPorId(getValor('produtoSelect'));
    setTexto('previewComissaoVenda', textoRegraComissao(produto, getValor('inputValor')));
}

function atualizarPreviewEdicao() {
    const produto = obterProdutoPorId(getValor('editProdutoSelect'));
    setTexto('previewComissaoEdicao', textoRegraComissao(produto, getValor('editValorVenda')));
}

async function salvarVendaAnalista(event) {
    event.preventDefault();
    const vendedorId = getValor('vendedorSelect');
    const produtoId = getValor('produtoSelect');
    const dataVenda = getValor('inputData');
    const valorVenda = parseFloat(getValor('inputValor'));
    const produto = obterProdutoPorId(produtoId);
    if (!produto) return mostrarMensagem('Falha ao recuperar regras de comissão do produto.');

    const comissaoGerada = calcularComissao(produto, valorVenda);
    try {
        await inserirVenda({ vendedor_id: vendedorId, produto_id: produtoId, data_venda: dataVenda, valor_venda: valorVenda, comissao_gerada: comissaoGerada });
        mostrarMensagem(`Venda cadastrada com sucesso. Comissão gerada: ${formatarMoeda(comissaoGerada)}`);
        resetarFormulario('formVenda');
        atualizarPreviewVenda();
        if (document.getElementById('secEditarVenda')?.classList.contains('active')) await carregarHistoricoAnalista();
    } catch (error) {
        mostrarMensagem('Erro ao gravar venda no banco: ' + error.message);
    }
}

async function carregarHistoricoAnalista() {
    mostrarCarregandoTabelaAnalista();
    try {
        listaVendasHistorico = await buscarVendasHistorico({ vendedorId: getValor('filtroVendedorHistorico'), mes: getValor('filtroMesHistorico') });
        renderizarHistoricoVendas(listaVendasHistorico, listaVendedores, listaProdutos);
    } catch (error) {
        const tbody = document.getElementById('tbodyVendas');
        if (tbody) tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar vendas: ${error.message}</td></tr>`;
    }
}

function abrirEdicaoVendaAnalista(vendaId) {
    const venda = listaVendasHistorico.find(v => Number(v.id) === Number(vendaId));
    if (!venda) return mostrarMensagem('Venda não encontrada na lista.');
    abrirBoxEdicaoVenda(venda);
    atualizarPreviewEdicao();
}

async function salvarEdicaoVendaAnalista(event) {
    event.preventDefault();
    const vendaId = getValor('editVendaId');
    const vendedorId = getValor('editVendedorSelect');
    const produtoId = getValor('editProdutoSelect');
    const dataVenda = getValor('editDataVenda');
    const valorVenda = parseFloat(getValor('editValorVenda'));
    const produto = obterProdutoPorId(produtoId);
    const comissaoGerada = calcularComissao(produto, valorVenda);

    try {
        await atualizarVenda(vendaId, { vendedor_id: vendedorId, produto_id: produtoId, data_venda: dataVenda, valor_venda: valorVenda, comissao_gerada: comissaoGerada });
        mostrarMensagem(`Venda atualizada. Nova comissão: ${formatarMoeda(comissaoGerada)}`);
        fecharBoxEdicaoVenda();
        await carregarHistoricoAnalista();
    } catch (error) {
        mostrarMensagem('Erro ao atualizar venda: ' + error.message);
    }
}

async function excluirVendaAnalista(vendaId) {
    if (!confirmarAcao('Tem certeza que deseja excluir esta venda? Essa ação remove o registro do banco.')) return;
    try {
        await deletarVenda(vendaId);
        mostrarMensagem('Venda excluída com sucesso.');
        fecharBoxEdicaoVenda();
        await carregarHistoricoAnalista();
    } catch (error) {
        mostrarMensagem('Erro ao excluir venda: ' + error.message);
    }
}

function limparFiltrosHistoricoAnalista() {
    setValor('filtroVendedorHistorico', '');
    setValor('filtroMesHistorico', '');
    carregarHistoricoAnalista();
}

async function salvarMetaAnalista(event) {
    event.preventDefault();
    const vendedorId = getValor('vendedorMetaSelect');
    const mesAnoFormatado = monthParaMesAnoBr(getValor('inputMesAno'));
    const valorMeta = parseFloat(getValor('inputValorMeta'));

    try {
        await inserirMeta({ vendedor_id: vendedorId, mes_ano: mesAnoFormatado, valor_meta: valorMeta });
        mostrarMensagem(`Meta cadastrada com sucesso para ${mesAnoFormatado}.`);
        resetarFormulario('formMeta');
        await carregarMetasAnalista();
    } catch (error) {
        mostrarMensagem('Erro ao estipular meta no sistema: ' + error.message);
    }
}

async function carregarMetasAnalista() {
    mostrarCarregandoTabela('tbodyMetas', 4);
    try {
        listaMetasHistorico = await buscarMetasHistorico({ vendedorId: getValor('filtroVendedorMetas'), mes: getValor('filtroMesMetas') });
        renderizarHistoricoMetas(listaMetasHistorico, listaVendedores);
    } catch (error) {
        const tbody = document.getElementById('tbodyMetas');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4">Erro ao carregar metas: ${error.message}</td></tr>`;
    }
}

function abrirEdicaoMetaAnalista(metaId) {
    const meta = listaMetasHistorico.find(m => Number(m.id) === Number(metaId));
    if (!meta) return mostrarMensagem('Meta não encontrada na lista.');
    abrirBoxEdicaoMeta(meta);
}

async function salvarEdicaoMetaAnalista(event) {
    event.preventDefault();
    const metaId = getValor('editMetaId');
    const vendedorId = getValor('editMetaVendedorSelect');
    const mesAnoFormatado = monthParaMesAnoBr(getValor('editMetaMesAno'));
    const valorMeta = parseFloat(getValor('editMetaValor'));

    try {
        await atualizarMeta(metaId, { vendedor_id: vendedorId, mes_ano: mesAnoFormatado, valor_meta: valorMeta });
        mostrarMensagem('Meta atualizada com sucesso.');
        fecharBoxEdicaoMeta();
        await carregarMetasAnalista();
    } catch (error) {
        mostrarMensagem('Erro ao atualizar meta: ' + error.message);
    }
}

async function excluirMetaAnalista(metaId) {
    if (!confirmarAcao('Tem certeza que deseja excluir esta meta?')) return;
    try {
        await deletarMeta(metaId);
        mostrarMensagem('Meta excluída com sucesso.');
        fecharBoxEdicaoMeta();
        await carregarMetasAnalista();
    } catch (error) {
        mostrarMensagem('Erro ao excluir meta: ' + error.message);
    }
}

function limparFiltrosMetasAnalista() {
    setValor('filtroVendedorMetas', '');
    setValor('filtroMesMetas', '');
    carregarMetasAnalista();
}

function carregarDadosProdutoComissao() {
    const produto = obterProdutoPorId(getValor('produtoComissaoSelect'));
    if (!produto) return;
    setValor('inputValorPadraoProduto', parseFloat(produto.valor_padrao || 0).toFixed(2));
    setValor('inputPremiacaoFixaProduto', parseFloat(produto.premiacao_fixa || 0).toFixed(2));
    setValor('inputPercentualProduto', produto.percentual_comissao ? parseFloat(produto.percentual_comissao).toFixed(2) : '');
}

function montarProdutoFormulario(prefixo) {
    const nomeId = prefixo ? `${prefixo}Nome` : 'inputNovoProdutoNome';
    const valorId = prefixo ? `${prefixo}Valor` : 'inputNovoProdutoValor';
    const premiacaoId = prefixo ? `${prefixo}Premiacao` : 'inputNovoProdutoPremiacao';
    const percentualId = prefixo ? `${prefixo}Percentual` : 'inputNovoProdutoPercentual';

    const nome = getValor(nomeId).trim();
    const valorPadrao = parseFloat(getValor(valorId) || 0);
    const premiacaoFixa = parseFloat(getValor(premiacaoId) || 0);
    const percentualDigitado = getValor(percentualId);
    const percentual = percentualDigitado === '' ? null : parseFloat(percentualDigitado);

    if (premiacaoFixa > 0 && percentual && percentual > 0) throw new Error('Use premiação fixa OU percentual. Não preencha os dois ao mesmo tempo.');
    if (nomeId.includes('Nome') && !nome) throw new Error('Informe o nome do produto.');

    const produto = { valor_padrao: valorPadrao, premiacao_fixa: premiacaoFixa, percentual_comissao: percentual };
    if (nomeId.includes('Nome')) produto.nome = nome;
    return produto;
}

async function salvarRegraProdutoAnalista(event) {
    event.preventDefault();
    const produtoId = getValor('produtoComissaoSelect');
    try {
        const produto = {
            valor_padrao: parseFloat(getValor('inputValorPadraoProduto') || 0),
            premiacao_fixa: parseFloat(getValor('inputPremiacaoFixaProduto') || 0),
            percentual_comissao: getValor('inputPercentualProduto') === '' ? null : parseFloat(getValor('inputPercentualProduto'))
        };
        if (produto.premiacao_fixa > 0 && produto.percentual_comissao && produto.percentual_comissao > 0) {
            mostrarMensagem('Use premiação fixa OU percentual. Não preencha os dois ao mesmo tempo.');
            return;
        }
        await atualizarProduto(produtoId, produto);
        await recarregarProdutosAnalista();
        resetarFormulario('formProdutoComissao');
        mostrarMensagem('Produto atualizado com sucesso. As próximas vendas já usarão a nova regra.');
    } catch (error) {
        mostrarMensagem('Erro ao atualizar produto: ' + error.message);
    }
}

async function salvarNovoProdutoAnalista(event) {
    event.preventDefault();
    try {
        const produto = montarProdutoFormulario('');
        await cadastrarProduto(produto);
        await recarregarProdutosAnalista();
        resetarFormulario('formNovoProduto');
        mostrarMensagem('Produto cadastrado com sucesso.');
    } catch (error) {
        mostrarMensagem('Erro ao cadastrar produto: ' + error.message);
    }
}

async function carregarProdutosAnalista() {
    await recarregarProdutosAnalista();
    renderizarTabelaProdutos(listaProdutos);
}

async function recarregarProdutosAnalista() {
    listaProdutos = await buscarProdutos();
    sincronizarSelectsAnalista();
    renderizarTabelaProdutos(listaProdutos);
    atualizarPreviewVenda();
}

function abrirEdicaoProdutoAnalista(produtoId) {
    const produto = obterProdutoPorId(produtoId);
    if (!produto) return mostrarMensagem('Produto não encontrado na lista.');
    abrirBoxEdicaoProduto(produto);
}

async function salvarEdicaoProdutoAnalista(event) {
    event.preventDefault();
    const produtoId = getValor('editProdutoId');
    try {
        const produto = montarProdutoFormulario('editProduto');
        await atualizarProduto(produtoId, produto);
        mostrarMensagem('Produto atualizado com sucesso.');
        fecharBoxEdicaoProduto();
        await recarregarProdutosAnalista();
    } catch (error) {
        mostrarMensagem('Erro ao atualizar produto: ' + error.message);
    }
}

async function excluirProdutoAnalista(produtoId) {
    if (!confirmarAcao('Tem certeza que deseja excluir este produto? Se ele estiver vinculado a vendas, o Supabase pode bloquear a exclusão.')) return;
    try {
        await deletarProduto(produtoId);
        mostrarMensagem('Produto excluído com sucesso.');
        fecharBoxEdicaoProduto();
        await recarregarProdutosAnalista();
    } catch (error) {
        mostrarMensagem('Erro ao excluir produto. Se já existem vendas com esse produto, edite em vez de excluir. Detalhe: ' + error.message);
    }
}

// GESTOR
async function iniciarGestor() {
    protegerRota('gestor');
    setTexto('txtBoasVindas', `Olá, ${localStorage.getItem('user_nome') || 'Gestor'}`);
    document.getElementById('btnSair')?.addEventListener('click', sairSistema);
    document.getElementById('btnAplicarFiltros')?.addEventListener('click', carregarDashboardGestor);

    try {
        const vendedores = await buscarVendedores();
        const produtos = await buscarProdutos();
        preencherSelect('filtroVendedor', vendedores, 'Todos os Vendedores', true);
        preencherSelect('filtroProduto', produtos, 'Todos os Produtos', true);
        await carregarDashboardGestor();
        criarIcones();
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
    }
}

async function carregarDashboardGestor() {
    try {
        const vendas = await buscarVendasGestor({ vendedorId: getValor('filtroVendedor'), produtoId: getValor('filtroProduto'), dataInicio: getValor('filtroDataInicio'), dataFim: getValor('filtroDataFim') });
        let faturamento = 0;
        let premios = 0;
        const dadosPorVendedor = {};
        const dadosPorProduto = {};

        vendas.forEach(venda => {
            const valor = parseFloat(venda.valor_venda) || 0;
            const premio = parseFloat(venda.comissao_gerada) || 0;
            const vendedor = venda.perfis?.nome || 'Desconhecido';
            const produto = venda.produtos?.nome || 'Outros';
            faturamento += valor;
            premios += premio;
            dadosPorVendedor[vendedor] = (dadosPorVendedor[vendedor] || 0) + premio;
            dadosPorProduto[produto] = (dadosPorProduto[produto] || 0) + valor;
        });

        const totalOrdens = vendas.length;
        atualizarKpisGestor({ faturamento, ticketMedio: totalOrdens ? faturamento / totalOrdens : 0, premios, mediaComissao: totalOrdens ? premios / totalOrdens : 0 });
        renderizarTabelaGestor(vendas);
        renderizarGraficosGestor(dadosPorVendedor, dadosPorProduto);
    } catch (error) {
        console.error('Erro ao processar dados de métricas filtradas:', error.message);
    }
}

function renderizarGraficosGestor(dadosPorVendedor, dadosPorProduto) {
    if (!window.Chart) return;
    if (chartRanking) chartRanking.destroy();
    if (chartProdutos) chartProdutos.destroy();
    const canvasRanking = document.getElementById('chartRanking');
    const canvasProdutos = document.getElementById('chartProdutos');

    if (canvasRanking) {
        chartRanking = new Chart(canvasRanking, {
            type: 'bar',
            data: { labels: Object.keys(dadosPorVendedor), datasets: [{ label: 'Premiação Gerada (R$)', data: Object.values(dadosPorVendedor), backgroundColor: '#8b5cf6', borderRadius: 6 }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    if (canvasProdutos) {
        chartProdutos = new Chart(canvasProdutos, {
            type: 'doughnut',
            data: { labels: Object.keys(dadosPorProduto), datasets: [{ data: Object.values(dadosPorProduto), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

// VENDEDOR
async function iniciarVendedor() {
    protegerRota('vendedor');
    setTexto('txtBoasVindas', `Olá, ${localStorage.getItem('user_nome') || 'Vendedor'}`);
    document.getElementById('btnSair')?.addEventListener('click', sairSistema);
    document.getElementById('btnFiltrar')?.addEventListener('click', () => carregarDadosVendedor(getValor('filtroInicio'), getValor('filtroFim')));
    await carregarDadosVendedor();
    criarIcones();
}

async function carregarDadosVendedor(inicio = null, fim = null) {
    const vendedorId = localStorage.getItem('user_id');
    const mesAno = mesAnoAtualBr();

    try {
        const vendas = await buscarVendasVendedor(vendedorId, inicio, fim);
        let totalFaturado = 0;
        let totalPremio = 0;
        vendas.forEach(venda => {
            totalFaturado += parseFloat(venda.valor_venda) || 0;
            totalPremio += parseFloat(venda.comissao_gerada) || 0;
        });
        renderizarTabelaVendedor(vendas);
        setTexto('totalVendas', formatarMoeda(totalFaturado));
        setTexto('totalPremio', formatarMoeda(totalPremio));
        const meta = await buscarMetaVendedor(vendedorId, mesAno);
        atualizarMetaVendedor(meta?.valor_meta || 0, totalFaturado, mesAno);
    } catch (error) {
        console.error('Erro ao carregar dados do vendedor:', error.message);
    }
}
