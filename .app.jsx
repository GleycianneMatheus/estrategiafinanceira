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
  const [inputFV, setInputFV] = useState('')
  const [inputMentoria, setInputMentoria] = useState('')

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
        supabase.from('clientes_fechou_venda').select('*').order('id', { ascending: false }),
        supabase.from('clientes_mentoria').select('*').order('id', { ascending: false }),
        supabase.from('dividas').select('*').order('id', { ascending: false })
      ])
      setClientesFV(fv || [])
      setClientesMentoria(mentoria || [])
      setDividas(div || [])
    } catch (err) {
      console.error('Erro ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar cliente Fechou Venda
  const adicionarClienteFV = async () => {
    if (!inputFV.trim()) return
    try {
      const { data, error } = await supabase
        .from('clientes_fechou_venda')
        .insert([{ name: inputFV, data: new Date().toISOString().split('T')[0] }])
        .select()
      
      if (!error && data) {
        setClientesFV([data[0], ...clientesFV])
        setInputFV('')
      } else {
        console.error('Erro:', error)
      }
    } catch (err) {
      console.error('Erro:', err)
    }
  }

  // Adicionar cliente Mentoria
  const adicionarClienteMentoria = async () => {
    if (!inputMentoria.trim()) return
    try {
      const { data, error } = await supabase
        .from('clientes_mentoria')
        .insert([{ name: inputMentoria, data: new Date().toISOString().split('T')[0] }])
        .select()
      
      if (!error && data) {
        setClientesMentoria([data[0], ...clientesMentoria])
        setInputMentoria('')
      } else {
        console.error('Erro:', error)
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
        
        {/* ABAS */}
        <div className="flex gap-2 mb-8 border-b border-slate-200 flex-wrap">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('fv')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'fv' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Fechou Venda ({clientesFV.length})
          </button>
          <button
            onClick={() => setActiveTab('mentoria')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'mentoria' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Mentoria ({clientesMentoria.length})
          </button>
          <button
            onClick={() => setActiveTab('dividas')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'dividas' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Dívidas
          </button>
        </div>

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
              </div>

              {/* Gastos Total */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                <p className="text-slate-600 text-sm font-medium">Gastos Totais</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  R$ {GASTOS_TOTAIS.toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Saldo */}
              <div className={`rounded-xl shadow-md p-6 border-l-4 ${saldo >= 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <p className="text-slate-600 text-sm font-medium">Saldo</p>
                <p className={`text-3xl font-bold mt-2 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {Math.abs(saldo).toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Meta R$ 5k */}
              <div className="bg-indigo-50 rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
                <p className="text-slate-600 text-sm font-medium">Faltam</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  R$ {faltaPara5k.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

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

            {/* PROGRESSO */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-8 text-white">
              <h3 className="font-bold text-xl mb-4">🎯 Clientes Faltam</h3>
              <p className="text-4xl font-bold">{Math.max(0, clientesFaltam)}</p>
              <p className="text-indigo-100 mt-2">clientes Fechou Venda para R$ 5k/mês</p>
            </div>
          </div>
        )}

        {/* FECHOU VENDA */}
        {activeTab === 'fv' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Clientes Fechou Venda</h2>
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                placeholder="Nome do cliente..."
                value={inputFV}
                onChange={(e) => setInputFV(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adicionarClienteFV()}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={adicionarClienteFV}
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
                      <p className="font-medium text-slate-900">{cliente.name}</p>
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
                type="text"
                placeholder="Nome do cliente..."
                value={inputMentoria}
                onChange={(e) => setInputMentoria(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adicionarClienteMentoria()}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={adicionarClienteMentoria}
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
                      <p className="font-medium text-slate-900">{cliente.name}</p>
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
                      R$ {divida.valor?.toLocaleString('pt-BR') || '0'}
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
