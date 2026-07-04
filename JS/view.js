// JS/view.js
// Camada VIEW: leitura e alteração de elementos da tela.

export function criarIcones() {
    if (window.lucide) window.lucide.createIcons();
}

export function mostrarMensagem(mensagem) {
    alert(mensagem);
}

export function confirmarAcao(mensagem) {
    return confirm(mensagem);
}

export function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.innerText = texto;
}

export function getValor(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

export function setValor(id, valor) {
    const el = document.getElementById(id);
    if (el) el.value = valor ?? '';
}

export function resetarFormulario(id) {
    const form = document.getElementById(id);
    if (form) form.reset();
}

export function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarDataBr(dataIso) {
    if (!dataIso) return '-';
    const partes = String(dataIso).split('-');
    if (partes.length !== 3) return dataIso;
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
}

export function monthParaMesAnoBr(valorMonth) {
    if (!valorMonth) return '';
    const [ano, mes] = valorMonth.split('-');
    return `${mes}/${ano}`;
}

export function mesAnoBrParaMonth(mesAno) {
    if (!mesAno || !mesAno.includes('/')) return '';
    const [mes, ano] = mesAno.split('/');
    return `${ano}-${String(mes).padStart(2, '0')}`;
}

export function mesAnoAtualBr() {
    const data = new Date();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${mes}/${ano}`;
}

export function protegerRota(cargoEsperado) {
    if (localStorage.getItem('user_cargo') !== cargoEsperado) window.location.href = 'index.html';
}

export function sairSistema(event) {
    if (event) event.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
}

export function obterDadosLogin() {
    return { email: getValor('email').trim(), password: getValor('password') };
}

export function setBotaoLogin(carregando) {
    const btn = document.getElementById('btnEntrar');
    if (!btn) return;
    btn.innerText = carregando ? 'Verificando...' : 'Entrar';
    btn.disabled = carregando;
}

export function redirecionarPorCargo(cargo) {
    if (cargo === 'gestor') window.location.assign('gestor.html');
    else if (cargo === 'analista') window.location.assign('analista.html');
    else if (cargo === 'vendedor') window.location.assign('vendedor.html');
    else mostrarMensagem('Cargo não cadastrado no sistema do Front-end.');
}

export function preencherSelect(id, lista, placeholder = 'Selecione...', manterPrimeiraOpcao = false) {
    const select = document.getElementById(id);
    if (!select) return;

    if (!manterPrimeiraOpcao) {
        select.innerHTML = '';
        select.add(new Option(placeholder, ''));
    }

    lista.forEach(item => select.add(new Option(item.nome, item.id)));
}

export function selecionarTarefa(secaoId, botao) {
    document.querySelectorAll('.task-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.task-card').forEach(el => el.classList.remove('active'));

    document.getElementById(secaoId)?.classList.add('active');
    botao?.classList.add('active');
    criarIcones();
}

export function mostrarCarregandoTabela(idTbody, colunas) {
    const tbody = document.getElementById(idTbody);
    if (tbody) tbody.innerHTML = `<tr><td colspan="${colunas}">Carregando...</td></tr>`;
}

export function mostrarCarregandoTabelaAnalista() {
    mostrarCarregandoTabela('tbodyVendas', 6);
}

export function renderizarHistoricoVendas(vendas, vendedores, produtos) {
    const tbody = document.getElementById('tbodyVendas');
    if (!tbody) return;

    if (!vendas.length) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhuma venda encontrada.</td></tr>';
        return;
    }

    tbody.innerHTML = vendas.map(venda => {
        const vendedor = vendedores.find(v => String(v.id) === String(venda.vendedor_id));
        const produto = produtos.find(p => String(p.id) === String(venda.produto_id));
        return `
            <tr>
                <td>${formatarDataBr(venda.data_venda)}</td>
                <td><strong>${vendedor ? vendedor.nome : 'Vendedor não encontrado'}</strong></td>
                <td>${produto ? produto.nome : 'Produto não encontrado'}</td>
                <td>${formatarMoeda(venda.valor_venda)}</td>
                <td><strong>${formatarMoeda(venda.comissao_gerada)}</strong></td>
                <td class="table-actions">
                    <button class="btn-small btn-editar-venda" type="button" data-id="${venda.id}">Editar</button>
                    <button class="btn-small btn-danger btn-excluir-venda" type="button" data-id="${venda.id}">Excluir</button>
                </td>
            </tr>`;
    }).join('');
}

export function abrirBoxEdicaoVenda(venda) {
    setValor('editVendaId', venda.id);
    setValor('editVendedorSelect', venda.vendedor_id);
    setValor('editProdutoSelect', venda.produto_id);
    setValor('editDataVenda', venda.data_venda);
    setValor('editValorVenda', parseFloat(venda.valor_venda || 0).toFixed(2));
    abrirBox('boxEditarVenda');
}

export function fecharBoxEdicaoVenda() {
    resetarFormulario('formEditarVenda');
    fecharBox('boxEditarVenda');
}

export function renderizarHistoricoMetas(metas, vendedores) {
    const tbody = document.getElementById('tbodyMetas');
    if (!tbody) return;

    if (!metas.length) {
        tbody.innerHTML = '<tr><td colspan="4">Nenhuma meta encontrada.</td></tr>';
        return;
    }

    tbody.innerHTML = metas.map(meta => {
        const vendedor = vendedores.find(v => String(v.id) === String(meta.vendedor_id));
        return `
            <tr>
                <td><strong>${vendedor ? vendedor.nome : 'Vendedor não encontrado'}</strong></td>
                <td>${meta.mes_ano || '-'}</td>
                <td>${formatarMoeda(meta.valor_meta)}</td>
                <td class="table-actions">
                    <button class="btn-small btn-editar-meta" type="button" data-id="${meta.id}">Editar</button>
                    <button class="btn-small btn-danger btn-excluir-meta" type="button" data-id="${meta.id}">Excluir</button>
                </td>
            </tr>`;
    }).join('');
}

export function abrirBoxEdicaoMeta(meta) {
    setValor('editMetaId', meta.id);
    setValor('editMetaVendedorSelect', meta.vendedor_id);
    setValor('editMetaMesAno', mesAnoBrParaMonth(meta.mes_ano));
    setValor('editMetaValor', parseFloat(meta.valor_meta || 0).toFixed(2));
    abrirBox('boxEditarMeta');
}

export function fecharBoxEdicaoMeta() {
    resetarFormulario('formEditarMeta');
    fecharBox('boxEditarMeta');
}

export function renderizarTabelaProdutos(produtos) {
    const tbody = document.getElementById('tbodyProdutos');
    if (!tbody) return;

    if (!produtos.length) {
        tbody.innerHTML = '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>';
        return;
    }

    tbody.innerHTML = produtos.map(produto => `
        <tr>
            <td><strong>${produto.nome}</strong></td>
            <td>${formatarMoeda(produto.valor_padrao)}</td>
            <td>${formatarMoeda(produto.premiacao_fixa)}</td>
            <td>${produto.percentual_comissao ? `${Number(produto.percentual_comissao)}%` : '-'}</td>
            <td class="table-actions">
                <button class="btn-small btn-editar-produto" type="button" data-id="${produto.id}">Editar</button>
                <button class="btn-small btn-danger btn-excluir-produto" type="button" data-id="${produto.id}">Excluir</button>
            </td>
        </tr>`).join('');
}

export function abrirBoxEdicaoProduto(produto) {
    setValor('editProdutoId', produto.id);
    setValor('editProdutoNome', produto.nome);
    setValor('editProdutoValor', parseFloat(produto.valor_padrao || 0).toFixed(2));
    setValor('editProdutoPremiacao', parseFloat(produto.premiacao_fixa || 0).toFixed(2));
    setValor('editProdutoPercentual', produto.percentual_comissao ? parseFloat(produto.percentual_comissao).toFixed(2) : '');
    abrirBox('boxEditarProduto');
}

export function fecharBoxEdicaoProduto() {
    resetarFormulario('formEditarProduto');
    fecharBox('boxEditarProduto');
}

function abrirBox(id) {
    const box = document.getElementById(id);
    if (box) {
        box.classList.remove('hidden');
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function fecharBox(id) {
    document.getElementById(id)?.classList.add('hidden');
}

export function renderizarTabelaGestor(vendas) {
    const tbody = document.getElementById('corpoTabelaVendas');
    if (!tbody) return;

    if (!vendas.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="sem-dados">Nenhuma ordem de faturamento encontrada para os filtros selecionados.</td></tr>';
        return;
    }

    tbody.innerHTML = vendas.map(venda => {
        const valor = parseFloat(venda.valor_venda) || 0;
        const premio = parseFloat(venda.comissao_gerada) || 0;
        const nomeVendedor = venda.perfis?.nome || 'Desconhecido';
        const nomeProduto = venda.produtos?.nome || 'Outros';
        return `
            <tr>
                <td>${formatarDataBr(venda.data_venda)}</td>
                <td><strong>${nomeVendedor}</strong></td>
                <td>${nomeProduto}</td>
                <td>${formatarMoeda(valor)}</td>
                <td style="color:#8b5cf6; font-weight:600;">${formatarMoeda(premio)}</td>
            </tr>`;
    }).join('');
}

export function atualizarKpisGestor({ faturamento, ticketMedio, premios, mediaComissao }) {
    setTexto('kpiFaturamento', formatarMoeda(faturamento));
    setTexto('kpiTicket', formatarMoeda(ticketMedio));
    setTexto('kpiPremios', formatarMoeda(premios));
    setTexto('kpiMediaComissao', formatarMoeda(mediaComissao));
}

export function renderizarTabelaVendedor(vendas) {
    const tbody = document.getElementById('tabelaVendasCorpo');
    if (!tbody) return;

    if (!vendas.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">Nenhuma venda localizada no período.</td></tr>';
        return;
    }

    tbody.innerHTML = vendas.map(venda => {
        const valor = parseFloat(venda.valor_venda) || 0;
        const comissao = parseFloat(venda.comissao_gerada) || 0;
        const dataFormatada = new Date(venda.data_venda).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        return `
            <tr>
                <td>${dataFormatada}</td>
                <td>${venda.produtos?.nome || 'Produto Removido'}</td>
                <td>${formatarMoeda(valor)}</td>
                <td style="color:#10b981; font-weight:500;">${formatarMoeda(comissao)}</td>
            </tr>`;
    }).join('');
}

export function atualizarMetaVendedor(valorMeta, totalFaturado, mesAno) {
    const meta = parseFloat(valorMeta || 0);

    if (meta > 0) {
        const percentual = Math.min((totalFaturado / meta) * 100, 100);
        const falta = Math.max(meta - totalFaturado, 0);
        setTexto('metaAtual', `Meta: ${formatarMoeda(meta)}`);
        setTexto('metaFalta', `Falta: ${formatarMoeda(falta)}`);
        setTexto('txtPercentualMeta', `${percentual.toFixed(1)}% atingido`);
        const barra = document.getElementById('barreProgresso');
        if (barra) barra.style.width = `${percentual}%`;
    } else {
        setTexto('metaAtual', 'Meta: R$ 0,00');
        setTexto('metaFalta', 'Falta: R$ 0,00');
        setTexto('txtPercentualMeta', `Nenhuma meta definida para ${mesAno}`);
        const barra = document.getElementById('barreProgresso');
        if (barra) barra.style.width = '0%';
    }
}
