'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, MessageCircle, Plus, Send, Search, X, Eye, Bot, User2, Heart, Sparkles, Zap, Crown, Settings } from 'lucide-react'

// Modelos de IA
type AIModel = 'blood-souls' | 'crystal-mode'

const AI_MODELS = {
  'blood-souls': {
    name: 'Blood Souls',
    description: 'Respostas rápidas (~80 chars)',
    icon: '🩸',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  'crystal-mode': {
    name: 'Crystal Mode',
    description: 'Respostas longas (~200 chars)',
    icon: '💎',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
}

interface Character {
  id: string
  name: string
  description: string
  avatar: string
  personality: string
  greeting: string
  category: string
  systemPrompt?: string
  chats?: number
  likes?: number
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
}

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [viewingCharacter, setViewingCharacter] = useState<Character | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedModel, setSelectedModel] = useState<AIModel>('blood-souls')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [newCharacter, setNewCharacter] = useState({
    name: '',
    description: '',
    avatar: '🎭',
    personality: '',
    greeting: '',
    category: 'Original',
    systemPrompt: ''
  })

  useEffect(() => { fetchCharacters() }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (selectedCharacter) {
      const saved = localStorage.getItem(`chat_${selectedCharacter.id}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.length > 0) { setMessages(parsed); return }
        } catch {}
      }
      setMessages([{
        id: 'greeting',
        content: selectedCharacter.greeting,
        role: 'assistant',
        createdAt: new Date().toISOString()
      }])
    }
  }, [selectedCharacter])

  useEffect(() => {
    if (selectedCharacter && messages.length > 0) {
      localStorage.setItem(`chat_${selectedCharacter.id}`, JSON.stringify(messages))
    }
  }, [messages, selectedCharacter])

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters')
      const data = await response.json()
      setCharacters(data)
    } catch (error) {
      console.error('Error fetching characters:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedCharacter || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    setMessages(prev => [...prev, {
      id: 'temp-' + Date.now(),
      content: userMessage,
      role: 'user',
      createdAt: new Date().toISOString()
    }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: selectedCharacter.id,
          message: userMessage,
          model: selectedModel
        })
      })

      const data = await response.json()

      if (data.response) {
        setMessages(prev => [...prev, {
          id: 'msg-' + Date.now(),
          content: data.response,
          role: 'assistant',
          createdAt: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        content: 'Desculpe, houve um erro. Tente novamente.',
        role: 'assistant',
        createdAt: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const createCharacter = async () => {
    if (!newCharacter.name || !newCharacter.personality || !newCharacter.greeting) return

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCharacter)
      })

      if (response.ok) {
        await fetchCharacters()
        setIsCreateOpen(false)
        setNewCharacter({ name: '', description: '', avatar: '🎭', personality: '', greeting: '', category: 'Original', systemPrompt: '' })
      }
    } catch (error) {
      console.error('Error creating character:', error)
    }
  }

  const clearHistory = () => {
    if (selectedCharacter) {
      localStorage.removeItem(`chat_${selectedCharacter.id}`)
    }
    setMessages([{
      id: 'greeting',
      content: selectedCharacter?.greeting || '',
      role: 'assistant',
      createdAt: new Date().toISOString()
    }])
  }

  const categories = ['all', ...new Set(characters.map(c => c.category))]

  const filteredCharacters = characters.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Tela de Chat
  if (selectedCharacter) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#1f1f1f] bg-[#0f0f0f] sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedCharacter(null)}
              className="text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl">
              {selectedCharacter.avatar}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white truncate">{selectedCharacter.name}</h2>
              <p className="text-xs text-gray-500 truncate">{selectedCharacter.category}</p>
            </div>

            {/* Model Selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModelSelector(!showModelSelector)}
                className={`${AI_MODELS[selectedModel].bgColor} ${AI_MODELS[selectedModel].color} border-[#2a2a2a] gap-2`}
              >
                <span>{AI_MODELS[selectedModel].icon}</span>
                <span className="hidden sm:inline text-xs">{AI_MODELS[selectedModel].name}</span>
              </Button>

              {showModelSelector && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-50">
                  {(Object.keys(AI_MODELS) as AIModel[]).map((model) => (
                    <button
                      key={model}
                      onClick={() => { setSelectedModel(model); setShowModelSelector(false) }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#252525] first:rounded-t-lg last:rounded-b-lg ${
                        selectedModel === model ? AI_MODELS[model].color : 'text-gray-400'
                      }`}
                    >
                      <span>{AI_MODELS[model].icon}</span>
                      <div>
                        <div className="text-sm font-medium">{AI_MODELS[model].name}</div>
                        <div className="text-xs text-gray-500">{AI_MODELS[model].description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={clearHistory}
              className="text-gray-400 hover:text-red-400 hover:bg-[#1a1a1a]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'bg-[#1a1a1a] text-gray-400'
                  }`}>
                    {message.role === 'user' ? <User2 className="w-4 h-4" /> : selectedCharacter.avatar}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#1a1a1a] text-gray-200 border border-[#2a2a2a]'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-sm">
                    {selectedCharacter.avatar}
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">{selectedModel === 'blood-souls' ? 'Processando...' : 'Refletindo...'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[#1f1f1f] bg-[#0f0f0f] sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-purple-600 focus:ring-purple-600/20"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className={`${selectedModel === 'blood-souls' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Tela Principal
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Z-Chat</h1>
                <p className="text-xs text-gray-500">Personagens AI</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar personagens..."
                className="w-full bg-[#141414] border-[#2a2a2a] text-white placeholder:text-gray-600 pl-10 focus:border-purple-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Model Selector + Create Button */}
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className={`${AI_MODELS[selectedModel].bgColor} ${AI_MODELS[selectedModel].color} border-[#2a2a2a] gap-2`}
                >
                  <span>{AI_MODELS[selectedModel].icon}</span>
                  <span className="hidden md:inline">{AI_MODELS[selectedModel].name}</span>
                </Button>

                {showModelSelector && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-[#2a2a2a]">
                      <p className="text-xs text-gray-500">Selecionar Modelo AI</p>
                    </div>
                    {(Object.keys(AI_MODELS) as AIModel[]).map((model) => (
                      <button
                        key={model}
                        onClick={() => { setSelectedModel(model); setShowModelSelector(false) }}
                        className={`w-full px-3 py-3 text-left flex items-center gap-3 hover:bg-[#252525] ${
                          selectedModel === model ? AI_MODELS[model].color : 'text-gray-400'
                        }`}
                      >
                        <span className="text-lg">{AI_MODELS[model].icon}</span>
                        <div>
                          <div className="text-sm font-medium">{AI_MODELS[model].name}</div>
                          <div className="text-xs text-gray-500">{AI_MODELS[model].description}</div>
                        </div>
                        {selectedModel === model && (
                          <span className="ml-auto text-green-400">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Button */}
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Criar</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#141414] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Criar Personagem</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Dê vida ao seu personagem único
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-[#2a2a2a] flex items-center justify-center text-3xl">
                          {newCharacter.avatar}
                        </div>
                        <Input
                          value={newCharacter.avatar}
                          onChange={(e) => setNewCharacter({ ...newCharacter, avatar: e.target.value })}
                          className="w-16 text-center bg-[#1a1a1a] border-[#2a2a2a] text-white"
                          placeholder="🎭"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-gray-400 text-xs">Nome *</Label>
                          <Input
                            value={newCharacter.name}
                            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                            className="bg-[#1a1a1a] border-[#2a2a2a] text-white mt-1"
                            placeholder="Nome do personagem"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-400 text-xs">Categoria</Label>
                          <Input
                            value={newCharacter.category}
                            onChange={(e) => setNewCharacter({ ...newCharacter, category: e.target.value })}
                            className="bg-[#1a1a1a] border-[#2a2a2a] text-white mt-1"
                            placeholder="Ex: Anime, Fantasia, Sci-Fi"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400 text-xs">Descrição</Label>
                      <Textarea
                        value={newCharacter.description}
                        onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                        className="bg-[#1a1a1a] border-[#2a2a2a] text-white mt-1 min-h-[60px]"
                        placeholder="Quem é esse personagem?"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-400 text-xs">Personalidade *</Label>
                      <Textarea
                        value={newCharacter.personality}
                        onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
                        className="bg-[#1a1a1a] border-[#2a2a2a] text-white mt-1 min-h-[60px]"
                        placeholder="Como o personagem age? Ex: gentil, misterioso, brincalhão..."
                      />
                    </div>

                    <div>
                      <Label className="text-gray-400 text-xs">Prompt Personalizado (Avançado)</Label>
                      <Textarea
                        value={newCharacter.systemPrompt}
                        onChange={(e) => setNewCharacter({ ...newCharacter, systemPrompt: e.target.value })}
                        className="bg-[#1a1a1a] border-[#2a2a2a] text-white mt-1 font-mono text-sm min-h-[80px]"
                        placeholder="Instruções especiais para a IA..."
                      />
                      <p className="text-xs text-gray-600 mt-1">Define como a IA deve se comportar</p>
                    </div>

                    <div>
                      <Label className="text-gray-400 text-xs">Mensagem de Boas-vindas *</Label>
                      <Textarea
                        value={newCharacter.greeting}
                        onChange={(e) => setNewCharacter({ ...newCharacter, greeting: e.target.value })}
                        className="bg-[#1a1a1a] border-[#2a2a2a] text-white mt-1 min-h-[60px]"
                        placeholder="Primeira mensagem do personagem..."
                      />
                    </div>

                    <Button
                      onClick={createCharacter}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!newCharacter.name || !newCharacter.personality || !newCharacter.greeting}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Criar Personagem
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Categorias */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{characters.length}</div>
            <div className="text-xs text-gray-500">Personagens</div>
          </div>
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">∞</div>
            <div className="text-xs text-gray-500">Mensagens</div>
          </div>
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">2</div>
            <div className="text-xs text-gray-500">Modelos AI</div>
          </div>
        </div>

        {/* Grid de Personagens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCharacters.map((character) => (
            <Card
              key={character.id}
              className="bg-[#141414] border-[#1f1f1f] hover:border-purple-600/50 transition-all duration-300 group overflow-hidden"
            >
              {/* Banner */}
              <div className="h-24 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 relative">
                <div className="absolute -bottom-6 left-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl shadow-lg border-2 border-[#0a0a0a]">
                    {character.avatar}
                  </div>
                </div>
              </div>

              <CardHeader className="pt-8 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white text-lg truncate">{character.name}</CardTitle>
                    <Badge variant="outline" className="border-[#2a2a2a] text-gray-500 text-xs mt-1">
                      {character.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <CardDescription className="text-gray-500 text-sm line-clamp-2 mb-3">
                  {character.description || character.personality}
                </CardDescription>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{character.chats || Math.floor(Math.random() * 1000)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{character.likes || Math.floor(Math.random() * 500)}</span>
                  </div>
                </div>

                {/* Botão Ver - Abre modal com descrição */}
                <Button
                  onClick={() => setViewingCharacter(character)}
                  className="w-full bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#2a2a2a]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCharacters.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum personagem encontrado</p>
          </div>
        )}
      </main>

      {/* Modal de Visualização com botão Conversar */}
      <Dialog open={!!viewingCharacter} onOpenChange={() => setViewingCharacter(null)}>
        <DialogContent className="bg-[#141414] border-[#2a2a2a] text-white max-w-lg">
          {viewingCharacter && (
            <>
              <div className="h-32 -mx-6 -mt-6 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 relative mb-4">
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-3xl shadow-lg border-2 border-[#141414]">
                    {viewingCharacter.avatar}
                  </div>
                </div>
              </div>

              <DialogHeader className="pt-4">
                <DialogTitle className="text-xl">{viewingCharacter.name}</DialogTitle>
                <Badge variant="outline" className="border-[#2a2a2a] text-gray-400 w-fit mt-1">
                  {viewingCharacter.category}
                </Badge>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-1">Descrição</h4>
                  <p className="text-gray-300 text-sm">{viewingCharacter.description || 'Sem descrição'}</p>
                </div>

                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-1">Personalidade</h4>
                  <p className="text-gray-300 text-sm">{viewingCharacter.personality}</p>
                </div>

                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-1">Introdução</h4>
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-gray-300 text-sm border border-[#2a2a2a]">
                    {viewingCharacter.greeting}
                  </div>
                </div>

                {/* Modelo selecionado */}
                <div className="flex items-center gap-2 py-2">
                  <span className="text-xs text-gray-500">Modelo:</span>
                  <Badge className={`${AI_MODELS[selectedModel].bgColor} ${AI_MODELS[selectedModel].color}`}>
                    {AI_MODELS[selectedModel].icon} {AI_MODELS[selectedModel].name}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      setSelectedCharacter(viewingCharacter)
                      setViewingCharacter(null)
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Conversar
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="border-[#2a2a2a] text-gray-400 hover:text-white">
                      Fechar
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] bg-[#0f0f0f] py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-white">Z-Chat</span>
          </div>
          <p className="text-gray-600 text-sm">Mensagens ilimitadas • Sem restrições • 100% Gratuito</p>
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-700">
            <span>#AI</span>
            <span>#ChatBot</span>
            <span>#Roleplay</span>
            <span>#Personagens</span>
            <span>#Gratuito</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
