import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [clientesFV, setClientesFV] = useState([])
  const [clientesMentoria, setClientesMentoria] = useState([])
  const [dividas, setDividas] = useState([])
  const [loading, setLoading] = useState(true)

  // CONSTANTES FINANCEIRAS
  const GASTOS_PESSOAIS = 21700
  const GASTOS_EMPRESA = 10500
  const GASTOS_TOTAIS = GASTOS_PESSOAIS + GASTOS_EMPRESA
  const RENDA_FIXA = 10700
  const META_SOBRA = 5000

  // VALORES POR CLIENTE
  const IMPLANTACAO_FV = 2400
  const RECORRENTE_FV = 500
  const VALOR_MENTORIA = 60000

  // Carregar dados do Supabase
  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [{ data: fv }, { data: mentoria }, { data: div }] = await Promise.all([
        supabase.from('clientes_fechou_venda').select('*'),
        supabase.from('clientes_mentoria').select('*'),
        supabase.from('dividas').select('*')
      ])
      setClientesFV(fv || [])
      setClientesMentoria(mentoria || [])
      setDividas(div || [])
      setLoading(false)
    } catch (err) {
      console.error('Erro ao carregar:', err)
      setLoading(false)
    }
  }

  // Adicionar cliente Fechou Venda
  const adicionarClienteFV = async (nome) => {
    if (!nome.trim()) return
    try {
      const { data, error } = await supabase
        .from('clientes_fechou_venda')
        .insert([{ nome, data: new Date().toISOString() }])
        .select()
      if (!error) {
        setClientesFV([...clientesFV, data[0]])
        document.getElementById('input-fv').value = ''
      }
    } catch (err) {
      console.error('Erro:', err)
    }
  }

  // Adicionar cliente Mentoria
  const adicionarClienteMentoria = async (nome) => {
    if (!nome.trim()) return
    try {
      const { data, error } = await supabase
        .from('clientes_mentoria')
        .insert([{ nome, data: new Date().toISOString() }])
        .select()
      if (!error) {
        setClientesMentoria([...clientesMentoria, data[0]])
        document.getElementById('input-mentoria').value = ''
      }
    } catch (err) {
      console.error('Erro:', err)
    }
  }

  // Deletar cliente
  const deletarCliente = async (tabela, id) => {
    try {
      await supabase.from(tabela).delete().eq('id', id)
      if (tabela === 'clientes_fechou_venda') {
        setClientesFV(clientesFV.filter(c => c.id !== id))
      } else {
        setClientesMentoria(clientesMentoria.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('Erro:', err)
    }
  }

  // CÁLCULOS
  const receitaFV = (clientesFV.length * IMPLANTACAO_FV) + (clientesFV.length * RECORRENTE_FV)
  const receitaMentoria = clientesMentoria.length * VALOR_MENTORIA
  const rendaTotal = RENDA_FIXA + receitaFV + receitaMentoria
  const saldo = rendaTotal - GASTOS_TOTAIS
  const faltaPara5k = Math.max(0, (GASTOS_TOTAIS + META_SOBRA) - rendaTotal)

  // Quanto falta vender
  const clientesFaltam = Math.ceil(faltaPara5k / (IMPLANTACAO_FV + RECORRENTE_FV))

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold">Carregando...</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900">💰 Estratégia Financeira</h1>
          <p className="text-slate-600 mt-1">Rodrigo & Gleycianne</p>
        </div>
      </header>

      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* DASHBOARD PRINCIPAL */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* NÚMEROS GRANDES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Renda Total */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <p className="text-slate-600 text-sm font-medium">Renda Total</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  R$ {rendaTotal.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500 mt-2">Fixa + Vendas</p>
              </div>

              {/* Gastos Total */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                <p className="text-slate-600 text-sm font-medium">Gastos Totais</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  R$ {GASTOS_TOTAIS.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500 mt-2">Pessoal + Empresa</p>
              </div>

              {/* Saldo */}
              <div className={`rounded-xl shadow-md p-6 border-l-4 ${saldo >= 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <p className="text-slate-600 text-sm font-medium">Saldo</p>
                <p className={`text-3xl font-bold mt-2 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {Math.abs(saldo).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500 mt-2">{saldo >= 0 ? '✅ Positivo' : '❌ Negativo'}</p>
              </div>

              {/* Meta R$ 5k */}
              <div className="bg-indigo-50 rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
                <p className="text-slate-600 text-sm font-medium">Meta: +R$ 5k</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  R$ {faltaPara5k.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500 mt-2">Faltam para meta</p>
              </div>
            </div>

            {/* BREAKDOWN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RENDA BREAKDOWN */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">📊 Renda (Breakdown)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Consultoria Fixa</span>
                    <span className="font-semibold text-green-600">R$ {RENDA_FIXA.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-slate-700">Fechou Venda ({clientesFV.length} clientes)</span>
                    <span className="font-semibold text-blue-600">R$ {receitaFV.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-slate-700">Mentoria ({clientesMentoria.length} clientes)</span>
                    <span className="font-semibold text-purple-600">R$ {receitaMentoria.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-900">TOTAL</span>
                    <span className="font-bold text-lg text-green-600">R$ {rendaTotal.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* GASTOS BREAKDOWN */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">💸 Gastos (Breakdown)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-slate-700">Gastos Pessoais</span>
                    <span className="font-semibold text-orange-600">R$ {GASTOS_PESSOAIS.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                    <span className="text-slate-700">Gastos Empresa (FV)</span>
                    <span className="font-semibold text-pink-600">R$ {GASTOS_EMPRESA.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-900">TOTAL</span>
                    <span className="font-bold text-lg text-red-600">R$ {GASTOS_TOTAIS.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PROGRESSO PARA META */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-8 text-white">
              <h3 className="font-bold text-xl mb-4">🎯 Progresso para Meta (R$ 5k/mês)</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-indigo-100">Clientes Fechou Venda faltam:</p>
                  <p className="text-4xl font-bold">{Math.max(0, clientesFaltam)}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-100">ou</p>
                  <p className="text-3xl font-bold">1 Mentoria</p>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all"
                  style={{width: `${Math.min(100, (rendaTotal / (GASTOS_TOTAIS + META_SOBRA)) * 100)}%`}}
                ></div>
              </div>
              <p className="text-indigo-100 mt-2 text-sm">
                {((rendaTotal / (GASTOS_TOTAIS + META_SOBRA)) * 100).toFixed(0)}% da meta
              </p>
            </div>
          </div>
        )}

        {/* ABAS */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('fv')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'fv' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Fechou Venda
          </button>
          <button
            onClick={() => setActiveTab('mentoria')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'mentoria' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Mentoria
          </button>
          <button
            onClick={() => setActiveTab('dividas')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'dividas' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Dívidas
          </button>
        </div>

        {/* FECHOU VENDA */}
        {activeTab === 'fv' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Clientes Fechou Venda</h2>
            <div className="mb-6 flex gap-2">
              <input
                id="input-fv"
                type="text"
                placeholder="Nome do cliente..."
                onKeyPress={(e) => e.key === 'Enter' && adicionarClienteFV(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => adicionarClienteFV(document.getElementById('input-fv').value)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Adicionar
              </button>
            </div>
            <div className="grid gap-2">
              {clientesFV.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhum cliente ainda</p>
              ) : (
                clientesFV.map((cliente) => (
                  <div key={cliente.id} className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{cliente.nome}</p>
                      <p className="text-sm text-slate-500">R$ 2.400 implantação + R$ 500/mês</p>
                    </div>
                    <button
                      onClick={() => deletarCliente('clientes_fechou_venda', cliente.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MENTORIA */}
        {activeTab === 'mentoria' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Clientes Mentoria</h2>
            <div className="mb-6 flex gap-2">
              <input
                id="input-mentoria"
                type="text"
                placeholder="Nome do cliente..."
                onKeyPress={(e) => e.key === 'Enter' && adicionarClienteMentoria(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => adicionarClienteMentoria(document.getElementById('input-mentoria').value)}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
              >
                Adicionar
              </button>
            </div>
            <div className="grid gap-2">
              {clientesMentoria.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhum cliente ainda</p>
              ) : (
                clientesMentoria.map((cliente) => (
                  <div key={cliente.id} className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{cliente.nome}</p>
                      <p className="text-sm text-slate-500">R$ 60.000</p>
                    </div>
                    <button
                      onClick={() => deletarCliente('clientes_mentoria', cliente.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DÍVIDAS */}
        {activeTab === 'dividas' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Dívidas</h2>
            <div className="grid gap-3">
              {dividas.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhuma dívida registrada</p>
              ) : (
                dividas.map((divida) => (
                  <div key={divida.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-slate-900">{divida.descricao}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      R$ {divida.valor_total?.toLocaleString('pt-BR') || '0'} total
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
