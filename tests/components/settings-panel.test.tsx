import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsPanel } from '../../src/renderer/components/SettingsPanel';

describe('SettingsPanel', () => {
  it('saves settings and credentials', () => {
    const onSave = jest.fn();
    const onSaveCredential = jest.fn();

    render(
      <SettingsPanel
        settings={{ theme: 'light', autoSync: false, apiBaseUrl: 'http://localhost:3000' }}
        onSave={onSave}
        onSaveCredential={onSaveCredential}
      />,
    );

    fireEvent.change(screen.getByDisplayValue('http://localhost:3000'), { target: { value: 'https://api.example.com' } });
    fireEvent.click(screen.getByText('Save settings'));
    expect(onSave).toHaveBeenCalledWith({ apiBaseUrl: 'https://api.example.com' });

    fireEvent.change(screen.getByPlaceholderText('API token'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByText('Store credential'));
    expect(onSaveCredential).toHaveBeenCalledWith('secret');
  });
});
