import React, {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
} from 'react';
import { FileTree } from 'nextra-theme-docs';

const ProviderContext = createContext({
  fileOpened: '',
  setFileOpened: () => null,
});

const useContextState = () => {
  return useContext(ProviderContext);
};

export const FileContent = ({ children, filename }) => {
  const { fileOpened } = useContextState();
  if (fileOpened === filename) {
    return <div className="">{children}</div>;
  }

  return null;
};

export const FileCollector = ({ children, defaultFileOpened }) => {
  const [fileOpened, setFileOpened] = useState(defaultFileOpened);

  const { tree, content } = useMemo(() => {
    const tree = [],
      content = [];

    Children.forEach(children, child => {
      if (isValidElement(child) && child.type === FileTree) {
        tree.push(child);
      } else if (isValidElement(child) && child.type === FileContent) {
        content.push(child);
      }
    });

    return { tree, content };
  }, []);

  return (
    <ProviderContext.Provider value={{ fileOpened, setFileOpened }}>
      <div className="nx-flex nx-gap-4">
        <div className="nx-flex-none" style={{ flex: 'none' }}>
          {tree}
        </div>
        <div className="nx-mt-6" style={{ flex: 1 }}>
          {content}
        </div>
      </div>
    </ProviderContext.Provider>
  );
};

export const FileLinkInjector = ({ children, filename }) => {
  const { fileOpened, setFileOpened } = useContextState();
  if (Children.only(children) && isValidElement(children)) {
    return cloneElement(children, {
      active: fileOpened === filename,
      label: (
        <span className="nx-cursor-pointer" onClick={() => setFileOpened(filename)}>
          {children.props.name}
        </span>
      ),
    });
  }

  return null;
};
