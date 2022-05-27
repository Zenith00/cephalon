import React, { useEffect, useState } from 'react';
import {
  AppShell, Container, Header, Textarea, Title,
} from '@mantine/core';

function Clip() {
  const [outText, setOutText] = useState('');
  const [disclaimer, setDisclaimer] = useState<boolean>(false);

  const pasteHandler = (e: React.ClipboardEvent) => {
    navigator.clipboard.read().then((e) => e.forEach((clipItem) => {
      if (clipItem.types.includes('text/html')) {
        clipItem.getType('text/html').then((res) => {
          res.text().then((pasteText) => {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(pasteText, 'text/html');
            const messages = htmlDoc.querySelectorAll(
              '.messageContent-2t3eCI',
            ) as NodeListOf<HTMLElement>;
            const messageText = [...messages].map((m) => m.innerText);
            setOutText(messageText.join('\n'));
          });
        });
      }
    }));
  };
  useEffect(() => {
    if (
      navigator.userAgent.toLowerCase().includes('mozilla')
      && !navigator.userAgent.toLowerCase().includes('chrom')
    ) {
      setDisclaimer(true);
    }
  }, []);

  return (
    <div>
      <AppShell
        header={(
          <Header height={40}>
            <Title order={2}>Discord Paste :)</Title>
          </Header>
        )}
      >
        <Container>
          {disclaimer && (
            <Title order={4}>
              dom.events.asyncClipboard.read must be enabled in about:config
            </Title>
          )}
          <Textarea
            onPaste={pasteHandler}
            p="md"
            placeholder="Paste here"
            autosize
            minRows={3}
            value=""
          />
          <Textarea
            value={outText}
            p="md"
            autosize
            minRows={5}
            placeholder="Output goes here"
          />
        </Container>
      </AppShell>
    </div>
  );
}

export default Clip;
