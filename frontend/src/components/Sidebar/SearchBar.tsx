import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { StateData } from '../../types';
import styles from './Sidebar.module.css';

interface SearchBarProps {
  states: StateData[];
  onSearchChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ states, onSearchChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return states
      .filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.uf.toLowerCase() === searchTerm.toLowerCase()
      )
      .slice(0, 5);
  }, [searchTerm, states]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (state: StateData) => {
    setSearchTerm(state.name);
    onSearchChange(state.uf);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearchChange('');
    setShowSuggestions(false);
  };

  return (
    <div className={styles.section} style={{ position: 'relative' }}>
      <div className={styles.sectionTitle}>
        <Search size={14} style={{ marginRight: 8 }} />
        Busca Inteligente
      </div>
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Estado ou UF..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
        />
        {searchTerm && (
          <X 
            size={14} 
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#8b949e' }} 
            onClick={clearSearch}
          />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className={styles.suggestionsContainer}>
          {suggestions.map(s => (
            <div 
              key={s.uf} 
              className={styles.suggestionItem}
              onClick={() => handleSuggestionClick(s)}
            >
              <span style={{ fontWeight: 600, color: '#00D4AA', marginRight: 8 }}>{s.uf}</span>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
